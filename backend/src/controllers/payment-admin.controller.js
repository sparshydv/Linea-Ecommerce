const { checkPaymentConsistency, recoverConfirmation, auditPaymentAnomalies } = require('../utils/paymentRecovery');
const { HTTP_STATUS } = require('../constants/httpStatus');
const logger = require('../utils/logger');

/**
 * ADMIN ONLY - Check payment consistency for an order
 * GET /api/admin/payments/:orderId/check
 *
 * Returns diagnostic info for manual recovery decisions
 */
const checkPaymentStatusHandler = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'orderId is required',
      });
    }

    const consistency = await checkPaymentConsistency(orderId);

    logger.info(`Admin payment check: ${orderId}`, { consistency });

    res.status(HTTP_STATUS.OK).json({
      success: consistency.isConsistent,
      message: consistency.isConsistent ? 'Order is consistent' : 'Order has issues',
      data: consistency,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ADMIN ONLY - Recover order from DB failure
 * POST /api/admin/payments/:orderId/recover
 *
 * Only allows recovery if payment succeeded but order not confirmed
 * Requires manual verification first
 */
const recoverOrderHandler = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { verified } = req.body; // Must explicitly confirm verification

    if (!orderId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'orderId is required',
      });
    }

    if (!verified) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'verified must be true (require explicit confirmation)',
      });
    }

    const result = await recoverConfirmation(orderId);

    logger.warn(`Admin recovery attempted: ${orderId}`, {
      result,
      adminAction: 'RECOVERY',
    });

    res.status(result.success ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST).json({
      success: result.success,
      message: result.message,
      data: result.order || null,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * ADMIN ONLY - Audit all payment anomalies
 * GET /api/admin/payments/anomalies
 *
 * Returns list of orders with inconsistent payment/status states
 */
const auditAnomaliesHandler = async (req, res, next) => {
  try {
    const anomalies = await auditPaymentAnomalies();

    logger.info(`Admin audit: Found ${anomalies.length} anomalies`, {
      count: anomalies.length,
      adminAction: 'AUDIT',
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Found ${anomalies.length} orders with payment anomalies`,
      data: {
        count: anomalies.length,
        anomalies,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  checkPaymentStatusHandler,
  recoverOrderHandler,
  auditAnomaliesHandler,
};
