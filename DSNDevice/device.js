async function initDeviceCenter() {
    // OS / Browser Detection
    const ua = navigator.userAgent;
    let osName = "Mobile OS";
    if (/iphone|ipad|ipod/i.test(ua)) {
        osName = "iOS (iPhone)";
    } else if (/android/i.test(ua)) {
        osName = "Android";
    } else if (/mac/i.test(ua)) {
        osName = "macOS";
    } else if (/win/i.test(ua)) {
        osName = "Windows";
    }
    document.getElementById('os-info').innerText = osName;

    // Battery (Fallback for iOS/Unsupported browsers)
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            const updateBattery = () => {
                const level = Math.round(battery.level * 100);
                const charging = battery.charging ? '⚡ Charging' : '🔋 Discharging';
                document.getElementById('battery-info').innerText = `${level}% (${charging})`;
            };
            updateBattery();
            battery.addEventListener('levelchange', updateBattery);
            battery.addEventListener('chargingchange', updateBattery);
        } catch (e) {
            document.getElementById('battery-info').innerText = 'iOS Restricted 🍏';
        }
    } else {
        document.getElementById('battery-info').innerText = 'iOS Restricted 🍏';
    }

    // Storage Quota
    if (navigator.storage && navigator.storage.estimate) {
        try {
            const estimate = await navigator.storage.estimate();
            const usedMB = (estimate.usage / (1024 * 1024)).toFixed(1);
            const totalGB = (estimate.quota / (1024 * 1024 * 1024)).toFixed(1);
            document.getElementById('storage-info').innerText = `${usedMB} MB / ${totalGB} GB`;
        } catch (e) {
            document.getElementById('storage-info').innerText = 'Active Storage';
        }
    } else {
        document.getElementById('storage-info').innerText = 'Not Available';
    }

    // Network Status
    const updateNetwork = () => {
        const online = navigator.onLine;
        document.getElementById('network-info').innerText = online ? '🟢 Online' : '🔴 Offline';
    };
    window.addEventListener('online', updateNetwork);
    window.addEventListener('offline', updateNetwork);
    updateNetwork();
}

initDeviceCenter();
