import PrismaClient from '@prisma/client';

const prisma = new PrismaClient();

const calcularIndiceTR = function(dtInicial, dtFinal) {

    const dataInicial = new Date(dtInicial);
    const dataFinal = new Date(dtFinal);

    if(dataInicial.getMonth == dataFinal.getMonth && dataInicial.getFullYear == dataFinal.getFullYear) {
        return 1; //dentro do mesmo mês não tem atualização segundo calculadora bacen.
    }



}

const calcularIndicesAteDia28 = function(dataInicial, dataFinal) {

    const taxas = await prisma.Tr.findMany({
        where: {
            dt_efetiva: { 
                gte: dataInicial,
                lte: dataFinal
            },
            dt_fim: {
                lte: dataFinal
            },
            [raw`strftime('%d', dt_efetiva)`]: {
                eq: new Date(dataFinal).getDate()
            },
            [raw`strftime('%d', dt_fim)`]: {
                eq: new Date(dataFinal).getDate()
            }
        }, 
        orderBy: {
            dt_efetiva: 'asc'
        }
    });

}

export { calcularIndiceTR };