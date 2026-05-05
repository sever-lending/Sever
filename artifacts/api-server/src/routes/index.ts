import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profileRouter from "./profile";
import loansRouter from "./loans";
import repaymentsRouter from "./repayments";
import dashboardRouter from "./dashboard";
import notificationsRouter from "./notifications";
import adminRouter from "./admin";
import stripeRouter from "./stripe";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(profileRouter);
router.use(loansRouter);
router.use(repaymentsRouter);
router.use(dashboardRouter);
router.use(notificationsRouter);
router.use(adminRouter);
router.use(stripeRouter);

export default router;
