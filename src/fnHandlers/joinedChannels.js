export default function joinedChannels(obj, { addMessage }) {
    console.log(obj)
    const message = () => (
        <div>
            {
                obj.map(d => (
                    <div key={d.channel}>
                        <span className="mr-2">{d.channel}</span>
                        - ACTIVE: <span className={d.isLive === "YES" ? "text-green-400" : "text-red-400"}> {d.isLive}</span>
                    </div>
                ))
            }
        </div>
    );
    addMessage('system', message);
}
