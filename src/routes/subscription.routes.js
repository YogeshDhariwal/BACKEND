import { Router } from "express";
import {verifyJwt} from "../middlewares/auth.middleware.js"
import { getSubscribedChannels,
     getUserChannelSubscriber, 
     toggleSubscription } from "../controllers/subscription.controller.js";

const router =Router()
router.use(verifyJwt)

router
.route('/:channelId')
.get(getUserChannelSubscriber)

router.route('/toggle/:channelId').get(toggleSubscription)

router
.route('/subscribed/:subscriberId')
.get(getSubscribedChannels)

export default router;
