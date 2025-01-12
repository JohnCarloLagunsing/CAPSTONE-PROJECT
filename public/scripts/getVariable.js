async function getEnvVariables() {
    try {
        const response = await fetch('https://www.ecentersanluis.com/env'); // Replace with your server URL if needed
        if (!response.ok) throw new Error('Failed to load environment variables');
        const env = await response.json();
        return env;
    } catch (error) {
        console.error('Error loading environment variables:', error);
        return {};
    }
}
