import { getKnex } from "../knex";
import { round } from './Round';

const calcularIndiceSelic = async function(dataInicial, dataFinal) 
{
    const knex = getKnex();

    const dataEfetivaFinal = await retornaDataFinalEmDiaUtil(dataFinal);

    const taxas = await knex('selic')
        .select('dt_efetiva', 'vr_taxa')
        .where('dt_efetiva', '>=', dataInicial)
        .andWhere('dt_efetiva', '<=', dataEfetivaFinal);

    var taxa = 1;
    var taxaAnterior = 1;

    taxas.forEach((taxaDiaria, index) => {
        if(index == 0) {
            taxaAnterior = taxaDiaria.vr_taxa;
        } else {
            taxa = taxa * ((taxaAnterior / 100) + 1);
            taxaAnterior = taxaDiaria.vr_taxa;
        }
    });
    return {
        indice: round(taxa, 8),
        dataInicial: dataInicial,
        dataFinal: dataFinal == dataEfetivaFinal ? dataFinal : dataEfetivaFinal+"*"
    };
}

const calcularSelicParaOValor = async function(valor, dataInicial, dataFinal) {
    const taxa = await calcularIndiceSelic(dataInicial, dataFinal);
    return round(valor * taxa, 2);
}

const retornaDataFinalEmDiaUtil = async function(data) {
    const knex = getKnex();
    const dataFinal = await knex('selic').select('dt_efetiva')
        .where('dt_efetiva', '>=', data)
        .first();

    return dataFinal.dt_efetiva == data ? data : dataFinal.dt_efetiva;
}

export { calcularSelicParaOValor, calcularIndiceSelic };