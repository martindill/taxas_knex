
import { calcularDiasUteis } from '../../services/CalcularTR';

export default async function handler(req, res) {
  
  console.log(calcularDiasUteis('2022-11-01', '2022-11-02', ['2022-11-02', '2022-11-15']), 1); //ok
  console.log(calcularDiasUteis('2022-11-01', '2022-11-03', ['2022-11-02', '2022-11-15']), 2); //ok
  console.log(calcularDiasUteis('2022-11-01', '2022-11-05', ['2022-11-02', '2022-11-15']), 3);
  console.log(calcularDiasUteis('2022-11-02', '2022-11-15', ['2022-11-02', '2022-11-15']) , 8);
  console.log(calcularDiasUteis('2022-11-02', '2022-11-16', ['2022-11-02', '2022-11-15']) , 9);
  console.log(calcularDiasUteis('2022-11-02', '2022-11-19', ['2022-11-02', '2022-11-15']) , 11);
  console.log(calcularDiasUteis('2022-11-13', '2022-11-15', ['2022-11-02', '2022-11-15']) , 1);
  console.log(calcularDiasUteis('2022-11-13', '2022-11-16', ['2022-11-02', '2022-11-15']) , 2);
  console.log(calcularDiasUteis('2022-11-13', '2022-11-19', ['2022-11-02', '2022-11-15']) , 4);
  console.log(calcularDiasUteis('2022-11-01', '2022-11-30', ['2022-11-02', '2022-11-15']) , 20);
  console.log(calcularDiasUteis('2022-11-01', '2022-12-01', ['2022-11-02', '2022-11-15']) ,21);
  console.log(calcularDiasUteis('2022-11-01', '2022-12-02', ['2022-11-02', '2022-11-15']) , 22);
  console.log(calcularDiasUteis('2022-11-01', '2022-12-03', ['2022-11-02', '2022-11-15']) , 22);
  console.log(calcularDiasUteis('2022-11-01', '2022-12-04', ['2022-11-02', '2022-11-15']) , 22);

  res.status(200).json('ok')
}
