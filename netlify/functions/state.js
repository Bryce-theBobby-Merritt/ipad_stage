const { getStore } = require("@netlify/blobs");

// In-memory fallback for local development
let localState = {};

// Check if we're in a proper Netlify environment
function isNetlifyBlobsAvailable() {
    return !!(process.env.NETLIFY_BLOBS_CONTEXT || process.env.SITE_ID);
}

exports.handler = async (event, context) => {
    const channel = process.env.CONTROL_CHANNEL || "default";
    const key = `state-${channel}`;
    const useBlobs = isNetlifyBlobsAvailable();

    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };

    // Handle CORS preflight
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers, body: "" };
    }

    // GET - return current state
    if (event.httpMethod === "GET") {
        let mode = "animation";

        if (useBlobs) {
            try {
                const store = getStore({ name: "display-state", consistency: "strong" });
                const state = await store.get(key);
                mode = state || "animation";
            } catch (err) {
                // Fall back to local state
                mode = localState[key] || "animation";
            }
        } else {
            // Use in-memory for local dev
            mode = localState[key] || "animation";
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ mode })
        };
    }

    // POST - toggle state
    if (event.httpMethod === "POST") {
        let currentMode = "animation";
        let newMode;

        if (useBlobs) {
            try {
                const store = getStore({ name: "display-state", consistency: "strong" });
                const state = await store.get(key);
                currentMode = state || "animation";
                newMode = currentMode === "animation" ? "static" : "animation";
                await store.set(key, newMode);
            } catch (err) {
                // Fall back to local state
                currentMode = localState[key] || "animation";
                newMode = currentMode === "animation" ? "static" : "animation";
                localState[key] = newMode;
            }
        } else {
            // Use in-memory for local dev
            currentMode = localState[key] || "animation";
            newMode = currentMode === "animation" ? "static" : "animation";
            localState[key] = newMode;
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ mode: newMode })
        };
    }

    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: "Method not allowed" })
    };
};
