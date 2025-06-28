import { Request, Response, NextFunction } from 'express';

export const validateBboxQuery = (req: Request, res: Response, next: NextFunction): void =>{
  const { bbox } = req.query;
  if (bbox === undefined) {
    // No bbox provided, skip validation
     next();
    
  }
  if (typeof bbox !== 'string') {
     res.status(400).json({ success: false, error: 'bbox must be a string if provided' });
     return
  }
  const bboxLimitsString = bbox.split(',');
  if (bboxLimitsString.length !== 4) {
     res.status(400).json({ success: false, error: 'bbox requis 4 coordinates to be supplied' });
     return;
  }
  const bboxLimitsNum = bboxLimitsString.map((item) => Number(item));
  const [minLon, minLat, maxLon, maxLat] = bboxLimitsNum;
  if (
    isNaN(minLon) || isNaN(minLat) || isNaN(maxLon) || isNaN(maxLat) ||
    minLat < 41 || maxLat > 84 ||
    minLon < -141 || maxLon > -52
  ) {
     res.status(400).json({ success: false, error: 'bbox coordinates are out of valid Canada bounds' });
     return;
  }
  next();
}

export const validateGNoLot = (req:Request,res:Response,next:NextFunction):void=>{
    
}