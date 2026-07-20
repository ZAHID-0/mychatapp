import aj from '../lib/arcjet.js';
import  {isSpoofedBot} from "@arcjet/inspect";

export const arcjetProtection = async (req, res ,next)=>{
    try {
        const decision = await aj.protect(req);

        if(decision.isDenied()) {
            if(decision.reason.isRateLimit()){
                return res.status(429).json({message : 'Rate Limit Exceeted'});
            } else if(decision.reason.isBot()) {
                return res.status(403).json({message : 'Bot Access Denied'});
            } else {
                return res.status(403).json({message : 'Access Denied By Security Policy'});
            }
        }

        if(decision.results.some(isSpoofedBot)) {
            return res.status(403).json({
                error : 'Spoofed Robot Detected',
                message : 'Malicious bot activity detected'
            });
        }

        next();
    } catch (error) {
        console.log("arcjet Protection Error : ",error);
        next();
    }
}