import { useEffect, useRef, useState, useCallback } from "react";
import { api } from "./api.js";
import { WS_BASE } from "./config.js";
import { MOCK_ORDERS } from "./mockData.js";

export function useLiveOrders(merchantId) {
	const [orders, setOrders] = useState([]);
	const [status, setStatus] = useState("loading"); // loading | ready | error | mock
	const [error, setError] = useState(null);
	const wsRef = useRef(null);

	const reload = useCallback(async () => {
		try {
			const list = await api.listOrders(merchantId);
			setOrders(list);
			setStatus("ready");
		} catch(e) {
			// Backend unreachable → fall back to mock data so UI is still demoable.
			console.warn("[dashboard] backend-core unreachable, using mock data:", e.message);
			setOrders(MOCK_ORDERS);
			setStatus("mock");
			setError(e.message);
		}
	}, [merchantId]);

	useEffect(() => {
		reload();
	}, [reload]);

	// WebSocket live updates
	useEffect(() => {
		if (!merchantId) return;
		const ws = new WebSocket(`${WS_BASE}/ws?merchant_id=${merchantId}`);
		wsRef.current = ws;

		ws.onopen = () => console.log("Connected to WebSocket");
		ws.onmessage = (evt) => {
			try {
				const msg = JSON.parse(evt.data);
				if (msg.type === "hello") return;
				if (msg.order_id && msg.status) {
					setOrders((prev) =>
						prev.map((o) => (o.id === msg.order_id ? { ...o, status: msg.status } : o))
					);
				}
			} catch {
				/* ignore */
			}
		};
		
		ws.onerror = (e) => {
			// Only log errors if the socket wasn't intentionally closed by React unmounting
			if (ws.readyState !== WebSocket.CLOSED) {
				console.warn("[dashboard] WS error — backend-realtime offline?", e);
			}
		};

		return () => {
			// If it's already open, close it safely
			if (ws.readyState === WebSocket.OPEN) {
				ws.close();
			} 
			// If it's still connecting, wait for it to open first, then immediately close it
			else if (ws.readyState === WebSocket.CONNECTING) {
				ws.onopen = () => ws.close();
			}
		};
	}, [merchantId]);

	return { orders, status, error, reload, setOrders };
}
