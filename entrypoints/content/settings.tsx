import React, { useState } from 'react';
import useStore from '../store/store';

const Settings = () => {
    const { apiKey, setApiKey } = useStore();
    const [input, setInput] = useState(apiKey);

    const handleSave = () => {
        console.log("Saving API key...", input.trim());
        setApiKey(input.trim());
    };

    return (
        <div className="p-4">
            <h2>Settings</h2>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your API key..."
                className="input input-bordered w-full"
            />
            <button onClick={handleSave} className="btn btn-primary mt-2">
                Save API Key
            </button>
        </div>
    );
};

export default Settings;
