
import { calcularIndiceSelic } from '../../services/CalcularSelic'

export default async function handler(req, res) {
  const indice = await calcularIndiceSelic('2019-12-02', '2019-12-31')
  res.status(200).json({'indice': indice})
}
