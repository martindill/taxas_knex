import { calcularIndiceTR } from '../services/CalcularTR';

test('apenas pro rata', async () => {
    const data = await calcularIndiceTR('2022-06-05', '2022-07-01');
    expect(data).toBe(1.00107);
});

test('apenas pro rata', async () => {
    const data = await calcularIndiceTR('2022-06-30', '2022-07-01');
    expect(data).toBe(1.00009110);
});

test('apenas pro rata', async () => {
    const data = await calcularIndiceTR('2022-06-30', '2022-07-02');
    expect(data).toBe(1.00018230);
});

test('periodo fechado', async () => {
    const data = await calcularIndiceTR('2022-06-30', '2022-07-30');
    expect(data).toBe(1.00200700);
});

test('periodo fechado', async () => {
    const data = await calcularIndiceTR('2022-02-28', '2022-07-28');
    expect(data).toBe(1.00577920);
});

test('periodo fechado + pro rata', async () => {
    const data = await calcularIndiceTR('2022-03-01', '2022-05-12');
    expect(data).toBe(1.00220650);
});

test('periodo fechado + pro rata', async () => {
    const data = await calcularIndiceTR('2022-03-01', '2022-05-14');
    expect(data).toBe(1.00278820);
});



test('periodo grande - dia final menor que inicial', async () => {
    const data = await calcularIndiceTR('2014-05-12', '2022-06-02');
    expect(data).toBe(1.05732400);
});

test('periodo grande  até dia 28', async () => {
    const data = await calcularIndiceTR('2014-05-12', '2022-06-27');
    expect(data).toBe(1.05579390);
});

test('periodo grande acima dia 28', async () => {
    const data = await calcularIndiceTR('2014-05-12', '2022-06-30');
    expect(data).toBe(1.05717370);
});

test('periodo grande acima dia 28 - termina fds', async () => {
    const data = await calcularIndiceTR('2014-05-12', '2022-04-30');
    expect(data).toBe(1.05423360);
});
		