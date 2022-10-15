import { getDayOfYear } from 'date-fns';
import SolarCalculator from 'lib/solar-calculator';
import { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  eot: number;
  localSolarTime: number;
  solarDeclination: number;
  elevationAngle: number;
  azimuthAngle: number;
};
export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { query } = req;
  const { lat, lng } = query as { lat: string; lng: string };

  const rad2Deg = 180 / Math.PI;

  const calculator = new SolarCalculator({
    lat: parseFloat(lat),
    lng: parseFloat(lng),
  });

  const date = new Date();
  const dayOfYear = getDayOfYear(date);
  const elapsedMinutes = date.getHours() * 60 + date.getMinutes();

  res.status(200).json({
    eot: calculator.alternateEquationOfTime(dayOfYear),
    localSolarTime: calculator.localSolarTime(dayOfYear, elapsedMinutes),
    solarDeclination: calculator.alternateSolarDeclination(dayOfYear),
    elevationAngle: calculator.elevationAngle(dayOfYear, elapsedMinutes) * rad2Deg,
    azimuthAngle: calculator.azimuthAngle(dayOfYear, elapsedMinutes) * rad2Deg,
  });
}
