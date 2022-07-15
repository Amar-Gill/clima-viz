import { find } from 'geo-tz';
import SolarCalculator from 'lib/solar-calculator';
import { convertTZ } from 'lib/utils';
import { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  elevationAngle: number;
  azimuthAngle: number;
};
export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { query } = req;
  const { lat, lng } = query as { lat: string; lng: string };

  const tzStrings = find(parseFloat(lat), parseFloat(lng));

  const calculator = new SolarCalculator({
    lat: parseFloat(lat),
    lng: parseFloat(lng),
  });

  const date = new Date();
  // convert date to a localized date based on timezone, but keep time values for the day consistent
  const localizedDate = convertTZ(date, tzStrings[0]);
  localizedDate.setHours(date.getHours());
  localizedDate.setMinutes(date.getMinutes());
  localizedDate.setSeconds(date.getSeconds());

  res.status(200).json({
    elevationAngle: calculator.elevationAngle(localizedDate),
    azimuthAngle: calculator.azimuthAngle(localizedDate),
  });
}
