import { Router } from 'express';

import { AuthRoutes } from './auth/auth.route';
import { CertificationRoutes } from './certification/certification.route';
import { CommunityRoutes } from './community/community.route';
import { OrderRoutes } from './order/order.route';
import { PlantTrackingRoutes } from './plant-tracking/plantTracking.route';
import { ProduceRoutes } from './produce/produce.route';
import { RentalSpaceRoutes } from './rental-space/rentalSpace.route';
import { VendorRoutes } from './vendor/vendor.route';

const router = Router();

router.use('/auth', AuthRoutes);
router.use('/vendors', VendorRoutes);
router.use('/certifications', CertificationRoutes);
router.use('/rental-spaces', RentalSpaceRoutes);
router.use('/produce', ProduceRoutes);
router.use('/orders', OrderRoutes);
router.use('/community-posts', CommunityRoutes);
router.use('/plant-tracking', PlantTrackingRoutes);

export const ApiRoutes = router;
