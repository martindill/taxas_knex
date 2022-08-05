import { calcularIndiceSelic } from '../services/CalcularSelic';

test('testes selic 1', async () => {
    const data = await calcularIndiceSelic('2022-06-01', '2022-06-05');
    expect(data.indice).toBe(1.00141904);
});

test('testes selic 2', async () => {
    const data = await calcularIndiceSelic('2022-06-01', '2022-06-30');
    expect(data.indice).toBe(1.00965805);
});

test('testes selic 3', async () => {
    const data = await calcularIndiceSelic('2022-06-05', '2022-07-01');
    expect(data.indice).toBe(1.00872174);
});

test('testes selic 4', async () => {
    const data = await calcularIndiceSelic('2022-06-30', '2022-07-01');
    expect(data.indice).toBe(1.00049037);
});

test('testes selic 5', async () => {
    const data = await calcularIndiceSelic('2022-06-30', '2022-07-02');
    expect(data.indice).toBe(1.00098098);
});

test('testes selic 6', async () => {
    const data = await calcularIndiceSelic('2022-07-02', '2022-07-28');
    expect(data.indice).toBe(1.00886355);
});

test('testes selic 7', async () => {
    const data = await calcularIndiceSelic('2014-05-12', '2022-06-02');
    expect(data.indice).toBe(1.92173273);
});

test('testes selic 8', async () => {
    const data = await calcularIndiceSelic('2014-05-12', '2022-06-27');
    expect(data.indice).toBe(1.93652576);
});

test('testes selic 9', async () => {
    const data = await calcularIndiceSelic('2014-05-12', '2022-06-30');
    expect(data.indice).toBe(1.93937600);
});

