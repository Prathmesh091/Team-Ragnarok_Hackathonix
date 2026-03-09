// Client-safe demo mode utilities (no server-side imports)

export function isDemoMode() {
    return typeof window !== 'undefined' && localStorage.getItem('veridion_demo_mode') === 'true';
}

export function enableDemoMode() {
    if (typeof window !== 'undefined') {
        localStorage.setItem('veridion_demo_mode', 'true');
    }
}

export function disableDemoMode() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('veridion_demo_mode');
    }
}
