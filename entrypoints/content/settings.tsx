const SettingsPage = () => {
    return (
        <div className="flex flex-col gap-5 items-center justify-center">
            <div className="form-control">
                <label className="label">
                    <span className="label-text">
                        Theme
                    </span>
                </label>
                <div className="select select-bordered w-full max-w-xs">
                    <select>
                        <option>Light</option>
                        <option>Dark</option>
                        <option>System</option>
                    </select>
                </div>
                <div className={"flex flex-col"}>
                    <label className={"label"}>API Key</label>
                    <input className={"input"} type="text" placeholder="Enter your API key" />
                    <button className="btn btn-primary btn-sm">Save</button>
                </div>
            </div>
        </div>
    )
}

export default SettingsPage;