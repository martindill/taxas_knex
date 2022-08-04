import { calcularDiasUteis } from '../services/CalcularTR';

test('começa em dia util', () => {
    expect(calcularDiasUteis('2022-11-01', '2022-11-02', ['2022-11-02', '2022-11-15'])).toBe(1);
    expect(calcularDiasUteis('2022-11-01', '2022-11-03', ['2022-11-02', '2022-11-15'])).toBe(2);
    expect(calcularDiasUteis('2022-11-01', '2022-11-05', ['2022-11-02', '2022-11-15'])).toBe(3);
});

test('começa em feriado', () => {
    expect(calcularDiasUteis('2022-11-02', '2022-11-15', ['2022-11-02', '2022-11-15'])).toBe(8);
    expect(calcularDiasUteis('2022-11-02', '2022-11-16', ['2022-11-02', '2022-11-15'])).toBe(9);
    expect(calcularDiasUteis('2022-11-02', '2022-11-19', ['2022-11-02', '2022-11-15'])).toBe(11);
});

test('começa em fim de semana', () => {
    expect(calcularDiasUteis('2022-11-13', '2022-11-15', ['2022-11-02', '2022-11-15'])).toBe(1);
    expect(calcularDiasUteis('2022-11-13', '2022-11-16', ['2022-11-02', '2022-11-15'])).toBe(2);
    expect(calcularDiasUteis('2022-11-13', '2022-11-19', ['2022-11-02', '2022-11-15'])).toBe(4);
});


test('testes com intervalos maiores', () => {
    expect(calcularDiasUteis('2022-11-01', '2022-11-30', ['2022-11-02', '2022-11-15'])).toBe(20);
    expect(calcularDiasUteis('2022-11-01', '2022-12-01', ['2022-11-02', '2022-11-15'])).toBe(21);
    expect(calcularDiasUteis('2022-11-01', '2022-12-02', ['2022-11-02', '2022-11-15'])).toBe(22);
    expect(calcularDiasUteis('2022-11-01', '2022-12-03', ['2022-11-02', '2022-11-15'])).toBe(22);
    expect(calcularDiasUteis('2022-11-01', '2022-12-04', ['2022-11-02', '2022-11-15'])).toBe(22);
});