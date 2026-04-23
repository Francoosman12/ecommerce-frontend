import React, { useState, useEffect, useRef } from "react";
import axiosClient from "../../api/axiosClient";
import { formatPrice } from "../../utils/formatPrice";
import { toast } from "react-toastify";
import {
  FaQrcode,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaSyncAlt,
} from "react-icons/fa";
import QRCode from "qrcode";

const STATUS_CONFIG = {
  pending: {
    label: "Esperando pago...",
    color: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-200",
    icon: <FaSpinner className="animate-spin" size={18} />,
  },
  approved: {
    label: "¡Pago aprobado!",
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
    icon: <FaCheckCircle size={18} />,
  },
  rejected: {
    label: "Pago rechazado",
    color: "text-red-500",
    bg: "bg-red-50 border-red-200",
    icon: <FaTimesCircle size={18} />,
  },
};

const QRPayment = ({ items, totalAmount, onSuccess, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [qrImageUrl, setQrImageUrl] = useState(null);
  const [externalRef, setExternalRef] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [polling, setPolling] = useState(false);
  const pollRef = useRef(null);

  // Generar QR al montar
  useEffect(() => {
    generateQR();
    return () => {
      clearInterval(pollRef.current);
      deleteQR();
    };
  }, []);

  // Polling cada 3 segundos cuando hay externalRef
  useEffect(() => {
    if (!externalRef) return;
    setPolling(true);
    pollRef.current = setInterval(() => checkStatus(), 3000);
    return () => clearInterval(pollRef.current);
  }, [externalRef]);

  // Si se aprueba, parar polling
  useEffect(() => {
    if (paymentStatus === "approved") {
      clearInterval(pollRef.current);
      setPolling(false);
      setTimeout(() => onSuccess?.(), 2000);
    }
  }, [paymentStatus]);

  const generateQR = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.put("/qr", {
        items,
        totalAmount,
        externalReference: `VENTA-${Date.now()}`,
        title: "Margarita Accesorios",
      });

      setExternalRef(data.externalReference);

      // Convertir qr_data string a imagen QR
      const imageUrl = await QRCode.toDataURL(data.qrData, {
        width: 280,
        margin: 2,
        color: { dark: "#3b1a14", light: "#fdf8f7" },
      });
      setQrImageUrl(imageUrl);
    } catch (error) {
      toast.error("Error al generar el QR de cobro");
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!externalRef) return;
    try {
      const { data } = await axiosClient.get(`/qr/status/${externalRef}`);
      if (data.status !== paymentStatus) {
        setPaymentStatus(data.status);
      }
    } catch {
      /* silencioso */
    }
  };

  const deleteQR = async () => {
    try {
      await axiosClient.delete("/qr");
    } catch {
      /* silencioso */
    }
  };

  const handleClose = async () => {
    clearInterval(pollRef.current);
    await deleteQR();
    onClose?.();
  };

  const statusCfg = STATUS_CONFIG[paymentStatus] || STATUS_CONFIG.pending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-cin-950/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-cin-800 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaQrcode className="text-cin-300" size={20} />
            <div>
              <h2 className="font-display text-lg text-white">Cobrar con QR</h2>
              <p className="text-cin-400 text-xs">Mercado Pago</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-cin-400 hover:text-white transition-colors p-1"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Monto */}
        <div className="px-6 py-4 bg-cin-50 border-b border-cin-100 text-center">
          <p className="text-xs text-cin-400 uppercase tracking-wide mb-1">
            Total a cobrar
          </p>
          <p className="font-display text-3xl font-semibold text-cin-800">
            {formatPrice(totalAmount)}
          </p>
        </div>

        {/* QR */}
        <div className="px-6 py-6 flex flex-col items-center">
          {loading ? (
            <div className="w-[280px] h-[280px] flex items-center justify-center bg-cin-50 rounded-xl">
              <FaSpinner className="animate-spin text-cin-400 text-3xl" />
            </div>
          ) : qrImageUrl ? (
            <div className="relative">
              <img
                src={qrImageUrl}
                alt="QR de pago"
                className={`w-[280px] h-[280px] rounded-xl transition-opacity ${paymentStatus === "approved" ? "opacity-30" : ""}`}
              />
              {paymentStatus === "approved" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaCheckCircle className="text-green-500" size={80} />
                </div>
              )}
            </div>
          ) : (
            <div className="w-[280px] h-[280px] flex items-center justify-center bg-red-50 rounded-xl">
              <p className="text-red-400 text-sm">Error al generar QR</p>
            </div>
          )}

          {/* Estado */}
          <div
            className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border ${statusCfg.bg}`}
          >
            <span className={statusCfg.color}>{statusCfg.icon}</span>
            <span className={`font-medium text-sm ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
          </div>

          {/* Instrucciones */}
          {paymentStatus === "pending" && !loading && (
            <p className="text-center text-xs text-cin-400 mt-3 leading-relaxed">
              El cliente debe escanear este QR con la app de Mercado Pago o
              cualquier billetera virtual.
            </p>
          )}

          {/* Botones */}
          <div className="flex gap-3 w-full mt-4">
            {paymentStatus !== "approved" && (
              <button
                onClick={generateQR}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 border border-cin-200 text-cin-600 hover:bg-cin-50 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                <FaSyncAlt size={12} /> Regenerar QR
              </button>
            )}
            <button
              onClick={handleClose}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                paymentStatus === "approved"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-cin-100 hover:bg-cin-200 text-cin-700"
              }`}
            >
              {paymentStatus === "approved" ? "Continuar" : "Cancelar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRPayment;
