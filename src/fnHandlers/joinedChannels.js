export default function joinedChannels(obj, { addMessage }) {
    const message = () => (
        <div>
            {
                obj.map(d => (
                    <div className="ml-3" key={d.channel}>
                        <span>{d.channel}</span>
                        - ACTIVE: <span className={d.isLive === "YES" ? "pl-3 text-green-400" : "text-red-400"}> {d.isLive}</span>
                    </div>
                ))
            }
        </div>
    );
    addMessage('system', message);
}
