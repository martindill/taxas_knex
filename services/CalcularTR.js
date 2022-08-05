import { getKnex } from '../knex';
import { round } from './Round';

const calcularIndiceTR = async function(dtInicial, dtFinal) {

    const dataInicial = new Date(dtInicial);
    const dataFinal = new Date(dtFinal);
    console.log("dataInicial", dataInicial);
    console.log("dataFinal", dataFinal);
    if(dataInicial.getUTCMonth() == dataFinal.getUTCMonth() && dataInicial.getFullYear() == dataFinal.getFullYear()) {
        throw "Não é possível calcular o índice de taxa referencial com datas dentro do mesmo mês";
    }

    //algoritmo diferente para dtFinal > 28
    if(dataFinal.getUTCDate() > 28) {
        var indicesPeriodo = await calcularIndicesAcimaDia28(dtInicial, dtFinal);
    } else {
        var indicesPeriodo = await calcularIndicesAteDia28(dtInicial, dtFinal);
    }
    
    //CALCULA APENAS PRO RATA
    if(indicesPeriodo.length == 0) {
        const taxaProRata = await calcularProRata(dtInicial);
        if(taxaProRata == 1) { return 1; } //taxa pro rata 1 elevado a potencia dias uteis é sempre 1

        const diasUteisPeriodoProRata = await diasUteisNoPeriodoProRata(dtInicial, dtFinal);
        console.log("diasUteisPeriodoProRata", diasUteisPeriodoProRata);
        //RETORNA O ÍNDICE PRO RATA COM A TAXA PRO RATA ELEVADO A POTENCIA DE DIAS UTEIS NO PERÍODO PRO RATA
        return corrigirIndice(Math.pow(taxaProRata, diasUteisPeriodoProRata));
    }
    
    let dataInicialBase = indicesPeriodo[0].dt_efetiva;
    let indicePeriodo = calcularIndice(indicesPeriodo);
    
    //se dia inicial e final for o mesmo, período é fechado e pode retornar o índice calculado.
    if(Math.floor( Math.abs(new Date(dataInicialBase)) - dataInicial ) / (1000*60*60*24) == 0) {
        return corrigirIndice(indicePeriodo);
    }
    
    let taxaProRata = await calcularProRata(dtInicial);
    console.log("taxa pro rata", taxaProRata);
    //SE TAXA PRO RATA É 1 (SIGNIFICA QUE CORREÇÃO NO PERÍODO É 0) ENTÃO PODE RETORNAR ÍNDICE
    if(taxaProRata == 1) {
        return corrigirIndice(indicePeriodo);
    }
    let diasUteisPeriodoProRata = await diasUteisNoPeriodoProRata(dtInicial, indicesPeriodo[0].dt_efetiva);
    console.log("dias uteis periodo pro rata", diasUteisPeriodoProRata);
    //CALCULA O ÍNDICE PRO RATA COM A TAXA PRO RATA ELEVADO A POTENCIA DE DIAS UTEIS NO PERÍODO PRO RATA
    let indiceProRataPeriodo = corrigirIndice(Math.pow(taxaProRata, diasUteisPeriodoProRata));

    return corrigirIndice(indicePeriodo * indiceProRataPeriodo);
}

const calcularIndice = function(indicesPeriodo) {
    var indice = 1;
    indicesPeriodo.forEach(function(indiceMensal) {
        indice = indice * (1 + (indiceMensal.vr_taxa/100));
    });
    
    return indice;
}

const corrigirIndice = function(indice) {
    return round(indice, 7);
}


const calcularIndicesAteDia28 = async function(dataInicial, dataFinal) {

    const knex = getKnex();

    const indicesPeriodo = await knex('tr')
        .select('dt_efetiva', 'dt_fim', 'vr_taxa')
        .whereBetween('dt_efetiva', [dataInicial, dataFinal])
        .where('dt_fim', '<=', dataFinal)
        .whereRaw("strftime('%d', dt_efetiva) = strftime('%d', ?)", dataFinal)
        .whereRaw("strftime('%d', dt_fim) = strftime('%d', ?)", dataFinal)
        .orderBy('dt_efetiva', 'asc');

        console.log("indicesPeriodo", indicesPeriodo);

    return indicesPeriodo;
}

const calcularIndicesAcimaDia28 = async function(dataInicial, dataFinal) {

    const knex = getKnex();

    const indicesPeriodo = await knex('tr')
        .select('dt_efetiva', 'dt_fim', 'vr_taxa')
        .whereBetween('dt_efetiva', [dataInicial, dataFinal])
        .where('dt_fim', '<=', dataFinal)
        .where(function() {
            this.whereRaw("strftime('%d', dt_efetiva) = strftime('%d', ?)", dataFinal)
                .orWhereRaw("strftime('%d', dt_efetiva) = '01'");
        }).where(function(){
            this.whereRaw("strftime('%d', dt_fim) = strftime('%d', ?)", dataFinal)
                .orWhereRaw("strftime('%d', dt_fim) = '01'");
        })
        .orderBy('dt_efetiva', 'desc');

        console.log("indicesPeriodo", indicesPeriodo);

        var indices = [];
        var acabou = false;
        var dataProcurada = new Date(dataFinal);
        const diaProcurado = dataProcurada.getUTCDate();
        
        while(!acabou) {
            var proximosIndices = indicesPeriodo.filter(function(indice) {
                return indice.dt_fim == formatDate(dataProcurada);
            });
            console.log("proximosIndices", proximosIndices);
            if(proximosIndices.length == 0) {
                acabou = true;
                continue;
            }

            var proximoIndice = proximosIndices.filter(function(indice) {
                return new Date(indice.dt_efetiva).getUTCDate() == diaProcurado;
            });

            if(proximoIndice.length == 1) {
                indices.push(proximoIndice[0]);
            } else {
                proximoIndice = proximosIndices.filter(function(indice) {
                    return new Date(indice.dt_efetiva).getUTCDate() == '01';
                });
                if(proximoIndice.length == 1) {
                    indices.push(proximoIndice[0]);
                } else {
                    throw "Erro no algoritmo de cálculo da TR com dtFim acima de 28/xx/xxxx";
                }
            }
            dataProcurada = new Date(proximoIndice[0].dt_efetiva);
        }
        return indices.reverse();

    }

    const calcularProRata = async function(dataInicial) {
        //no caso de periodo restante, procurar índice pro-rata relativo a data inicial
        const knex = getKnex();
        const taxaProRata = await knex('tr_prorata')
            .select('dt_efetiva', 'dt_fim', 'vr_taxa')
            .where('dt_efetiva', dataInicial);

        console.log("taxa pro_rata calculada", taxaProRata, "dataInicial", dataInicial);

        var taxaDesejada = taxaProRata[0];

        //caso a data inicial seja 01/xx certificar-se que vai pegar taxa do dia 1 ao dia 1 do mes seguinte.
        if(new Date(dataInicial).getUTCDate() == "01") {
            taxaDesejada = taxaProRata.filter(function(taxa) {
                return new Date(taxa.dt_fim).getUTCDate() == "01";
            });
            return 1 + (taxaDesejada[0].vr_taxa/100);
        }
        return 1 + (taxaDesejada.vr_taxa/100);
    }

    const diasUteisNoPeriodoProRata = async function(dataInicial, dataFinal) {
        //CAPTURA FERIADOS NO PERÍODO
        const knex = getKnex();
        const feriados = await knex('feriados')
            .select('dt_feriado')
            .whereBetween('dt_feriado', [dataInicial, dataFinal]);
        
        const datasFeriados = feriados.map(feriado => feriado.dt_feriado);
        console.log("datasFeriados", datasFeriados);
        //RETORNA QUANTIDADE DIAS UTEIS DA DATA INICIAL ATÉ A DATA DO PRIMEIRO ÍNDICE (BASE)
        //SE $dataFinal for fim de semana ou feriado, soma 1 dia
        if(datasFeriados.includes(dataFinal) || new Date(dataFinal).getUTCDay() == 0 || new Date(dataFinal).getUTCDay() == 6) {
            console.log('dataFinal é feriado ou fim de semana');
            return calcularDiasUteis(dataInicial, dataFinal, datasFeriados);
        } 
        console.log('dataFinal nao é feriado ou fim de semana');
        return calcularDiasUteis(dataInicial, dataFinal, datasFeriados) - 1;
    }

    const calcularDiasUteis = function(dataInicial, dataFinal, feriados) {
        const dtInicial = new Date(dataInicial);
        const dtFinal = new Date(dataFinal);
        console.log("dtInicial", dtInicial, "dtFinal", dtFinal);
        var qtdDiasUteis = 0;
        var dataAtual = new Date(dataInicial);
        while (dataAtual <= dtFinal) {
            // Skips Sunday and Saturday
            var dataFormatada = formatDate(dataAtual);
            if (dataAtual.getUTCDay() != 0 && dataAtual.getUTCDay() != 6 && !feriados.includes(dataFormatada)) {
                qtdDiasUteis++;
                //console.log('dia util: ' + dataFormatada, dataAtual.getUTCDay());
            }
            dataAtual.setDate(dataAtual.getDate() + 1);
        }
        return qtdDiasUteis;
    }

    const formatDate = (date) => {
        let d = date;
        let month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
        let day = d.getUTCDate().toString().padStart(2, '0');
        let year = d.getFullYear();
        return [year, month, day].join('-');
      }

    


export { calcularIndiceTR, calcularDiasUteis };