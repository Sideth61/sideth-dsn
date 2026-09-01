async function initDeviceCenter() {
    // OS / Browser
    document.getElementById('os-info').innerText = navigator.platform || 'Mobile OS';

    // Battery
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
            document.getElementById('battery-info').innerText = 'Not Supported';
        }
    } else {
        document.getElementById('battery-info').innerText = 'Not Supported';
    }

    // Storage Quota
    if (navigator.storage && navigator.storage.estimate) {
        try {
            const estimate = await navigator.storage.estimate();
            const usedMB = (estimate.usage / (1024 * 1024)).toFixed(1);
            const totalGB = (estimate.quota / (1024 * 1024 * 1024)).toFixed(1);
            document.getElementById('storage-info').innerText = `${usedMB} MB / ${totalGB} GB`;
        } catch (e) {
            document.getElementById('storage-info').innerText = 'Available';
        }
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
