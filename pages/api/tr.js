import { calcularIndiceTR } from "../../services/CalcularTR"

export default async function handler(req, res) 
{
  try {
    const indice = await calcularIndiceTR(req.query.dtInicial, req.query.dtFinal)
    res.status(200).json({ 'indice': indice })
  } catch (error) {
    res.status(500).json({ 'erro': error })
  }
}
