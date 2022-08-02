import { getKnex } from '../knex';

const calcularIndiceTR = function(dtInicial, dtFinal) {

    const dataInicial = new Date(dtInicial);
    const dataFinal = new Date(dtFinal);

    if(dataInicial.getMonth == dataFinal.getMonth && dataInicial.getFullYear == dataFinal.getFullYear) {
        return 1; //dentro do mesmo mês não tem atualização segundo calculadora bacen.
    }

    //algoritmo diferente para dtFinal > 28
    if(dataFinal.getUTCDate() > 28) {
        var indicesPeriodo = recuperaIndicesAcimaDia28(dtInicial, dtFinal);
    } else {
        var indicesPeriodo = recuperaIndicesAteDia28(dtInicial, dtFinal);
    }

    //CALCULA APENAS PRO RATA
    if(indicesPeriodo.length == 0) {
        const taxaProRata = calcularProRata(dataInicial);
        if(taxaProRata == 1) { return 1; } //taxa pro rata 1 elevado a potencia dias uteis é sempre 1

        const diasUteisPeriodoProRata = diasUteisNoPeriodoProRata(dataInicial, dataFinal);

        //RETORNA O ÍNDICE PRO RATA COM A TAXA PRO RATA ELEVADO A POTENCIA DE DIAS UTEIS NO PERÍODO PRO RATA
        return Math.pow(taxaProRata, diasUteisPeriodoProRata).toFixed(7);
    }

    let dataInicialBase = indicesPeriodo[0].dt_efetiva;
    let indicePeriodo = calcularIndice(indicesPeriodo);

    //se dia inicial e final for o mesmo, período é fechado e pode retornar o índice calculado.
    if(Math.floor( Math.abs(new Date(dataInicialBase)) - dataInicial ) / (1000*60*60*24) == 0) {
        return indicePeriodo.toFixed(7);
    }
    
    let taxaProRata = calcularProRata(dataInicial);

    //SE TAXA PRO RATA É 1 (SIGNIFICA QUE CORREÇÃO NO PERÍODO É 0) ENTÃO PODE RETORNAR ÍNDICE
    if(taxaProRata == 1) {
        return indicePeriodo.toFixed(7);
    }
    let diasUteisPeriodoProRata = diasUteisNoPeriodoProRata(dataInicial, dataInicialBase);
    
    //CALCULA O ÍNDICE PRO RATA COM A TAXA PRO RATA ELEVADO A POTENCIA DE DIAS UTEIS NO PERÍODO PRO RATA
    let indiceProRataPeriodo = Math.pow(taxaProRata, diasUteisPeriodoProRata);

    return (indicePeriodo * indiceProRataPeriodo).toFixed(7);
}

const calcularIndice = function(indicesPeriodo) {
    var indice = 1;
    indicesPeriodo.foreach(function(indiceMensal) {
        indice = indice * (1 + (indiceMensal.vr_taxa/100));
    });
    
    return indice;
}

const calcularIndicesAteDia28 = async function(dataInicial, dataFinal) {

    const knex = getKnex();

    /**
     * select * 
        from tr
    where 
        dt_efetiva between '2022-06-01' and '2022-07-10'
        and dt_fim <= '2022-07-10'
        and strftime('%d', dt_efetiva) = strftime('%d', '2022-07-10')
        and strftime('%d', dt_fim) = strftime('%d', '2022-07-10')
    order by dt_efetiva asc
     */

    const taxas = await knex('tr')
        .select('dt_efetiva', 'dt_fim', 'vr_taxa')
        .whereBetween('dt_efetiva', [dataInicial, dataFinal])
        .where('dt_fim', '<=', dataFinal)
        .whereRaw("strftime('%d', dt_efetiva) = strftime('%d', ?)", dataFinal)
        .whereRaw("strftime('%d', dt_fim) = strftime('%d', ?)", dataFinal)
        .orderBy('dt_efetiva', 'asc');

    return taxas;
}

const calcularIndicesAcimaDia28 = async function(dataInicial, dataFinal) {

    const knex = getKnex();

    /**
     * $indicesPeriodo = TaxaReferencial::selectRaw('*, 1 + (VR_TAXA / 100) as indice_correcao')
                ->whereBetween('DT_EFETIVA', [$dtInicial, $dtFinal])
                ->where('DT_FIM', '<=', $dtFinal)
                ->where(function ($query) use ($dtFinal) {
                    $query->where(DB::raw("DAY(DT_EFETIVA)"), DB::raw("DAY('{$dtFinal}')"))
                        ->orWhere(DB::raw("DAY(DT_EFETIVA)"), DB::raw(01));
                })->where(function ($query) use ($dtFinal) {
                    $query->where(DB::raw("DAY(DT_FIM)"), DB::raw("DAY('{$dtFinal}')"))
                        ->orWhere(DB::raw("DAY(DT_FIM)"), DB::raw(01));
                })->orderBy('DT_EFETIVA', 'desc')
                ->get();
     */

    const indicesPeriodo = await knex('tr')
        .select('dt_efetiva', 'dt_fim', 'vr_taxa')
        .whereBetween('dt_efetiva', [dataInicial, dataFinal])
        .where('dt_fim', '<=', dataFinal)
        .where(function() {
            this.whereRaw("strftime('%d', dt_efetiva) = strftime('%d', ?)", dataFinal)
                .orWhereRaw("strftime('%d', dt_efetiva) = strftime('%d', 01)");
        }).where(function(){
            this.whereRaw("strftime('%d', dt_fim) = strftime('%d', ?)", dataFinal)
                .orWhereRaw("strftime('%d', dt_fim) = strftime('%d', 01)");
        })
        .orderBy('dt_efetiva', 'desc');

        var indices = [];
        var acabou = false;
        var dataProcurada = new Date(dataFinal);
        var diaProcurado = dataProcurada.getUTCDate();

        while(!acabou) {
            var proximosIndices = indicesPeriodo.filter(function(indice) {
                return indice.dt_fim == dataFinal;
            });

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
            dataProcurada = proximoIndice[0].dt_efetiva;
        }
        return indices.reverse();

    }

    const calcularProRata = async function(dataInicial) {
        //no caso de periodo restante, procurar índice pro-rata relativo a data inicial
        const taxaProRata = await knex('tr_prorata')
        .where('DT_EFETIVA', dataInicial);

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

    const diasUteisNoPeriodoProRata = function(dataInicial, dataFinal) {

    }


export { calcularIndiceTR };