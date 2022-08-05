
import { calcularIndiceSelic } from '../../services/CalcularSelic'

export default async function handler(req, res) {
  const indice = await calcularIndiceSelic('2022-06-30', '2022-07-04')
  res.status(200).json({'indice': indice})
}
