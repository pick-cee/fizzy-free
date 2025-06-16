// src/components/PwaUpdater.tsx

import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

/**
 * This component handles the PWA update lifecycle.
 * It automatically updates the service worker when a new version is available.
 */
export const PwaUpdater: React.FC = () => {
	const {
		needRefresh: [needRefresh],
		updateServiceWorker,
	} = useRegisterSW({
		onRegistered(r) {
			console.log("Service Worker registered successfully.");
		},
		onRegisterError(error) {
			console.error("Service Worker registration error:", error);
		},
	});

	useEffect(() => {
		// This effect will run whenever the PWA detects a new version waiting.
		if (needRefresh) {
			// This tells the new service worker to take over immediately.
			// The `true` parameter also forces a page reload to load the new assets.
			updateServiceWorker(true);
		}
	}, [needRefresh, updateServiceWorker]);

	// This component renders nothing to the DOM.
	return null;
};
