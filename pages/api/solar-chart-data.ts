import SolarCalculator from 'lib/solar-calculator';
import { getDaysOfYear } from 'lib/utils';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  solarNoonData: number[];
  equationOfTimeData: number[];
  solarDeclinationData: number[];
};

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { query } = req;
  const { year, lat, lng } = query as { year: string; lat: string; lng: string };

  const calculator = new SolarCalculator({
    lat: parseFloat(lat),
    lng: parseFloat(lng),
  });

  const days = getDaysOfYear(parseInt(year));

  res.status(200).json({
    solarNoonData: days.map((date) => calculator.calculateSolarNoon(date)),
    equationOfTimeData: days.map((date) => calculator.calculateEquationOfTime(date)),
    solarDeclinationData: days.map((date) => calculator.calculateSolarDeclination(date)),
  });
}
