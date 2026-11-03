/**
 * JanSamadhan – Location & Map Query Zod Schemas
 * Validates bounding box, coordinates, filters, and radius searches.
 */

const { z } = require('zod');

const getMapReportsSchema = z.object({
  bbox: z
    .string()
    .trim()
    .regex(
      /^-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?$/,
      'Bounding box must be minLng,minLat,maxLng,maxLat'
    )
    .optional(),
  city: z.string().trim().optional(),
  wardId: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
  status: z.enum(['SUBMITTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'ALL']).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'ALL']).optional(),
  verifiedOnly: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => val === true || val === 'true')
    .optional(),
  limit: z.coerce.number().min(1).max(2000).default(500),
});

const getNearbyReportsSchema = z.object({
  lat: z.coerce
    .number({ required_error: 'Latitude is required' })
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  lng: z.coerce
    .number({ required_error: 'Longitude is required' })
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  radius: z.coerce
    .number()
    .min(0.1, 'Radius must be at least 0.1 km')
    .max(50, 'Radius cannot exceed 50 km')
    .default(5),
  limit: z.coerce
    .number()
    .min(1)
    .max(100)
    .default(20),
  categoryId: z.string().trim().optional(),
  status: z.enum(['SUBMITTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'ALL']).optional(),
});

const reverseGeocodeSchema = z.object({
  lat: z.coerce
    .number({ required_error: 'Latitude is required' })
    .min(-90)
    .max(90),
  lng: z.coerce
    .number({ required_error: 'Longitude is required' })
    .min(-180)
    .max(180),
});

module.exports = {
  getMapReportsSchema,
  getNearbyReportsSchema,
  reverseGeocodeSchema,
};
