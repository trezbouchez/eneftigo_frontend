export function SectionHeader({ title, showingMore, onMoreButton }) {

    return (
        <div style={{}}>
            <div style={{ height: "1px", backgroundColor: "var(--eneftigo-dark-grey)", margin: "12px 0px -12px 0px" }} />
            <div style={{ display: "flex", alignContent: "center", justifyContent: "space-between", height: "24px", width: "100%" }}>
                <div style={{width:"40px", margin:"auto 24px auto 12px"}}></div>
                <div style={{ display: "flex", alignContent: "center", justifyContent: "space-between",  height: "24px", borderColor:"var(--eneftigo-dark-grey)", borderWidth:"1px", borderStyle:"solid", backgroundColor: "var(--eneftigo-black)", borderRadius: "12px", margin: "0" }}>
                    <p style={{ color:"var(--eneftigo-grey)", fontFamily: "var(--eneftigo-header-font-family)", textAlign: "center", fontSize: "14px", margin: "auto 8px auto 8px", }}>{title}</p>
                </div>
                {
                    onMoreButton ?
                    <button onClick={onMoreButton} style={{ backgroundColor: "var(--eneftigo-black)", color: "var(--eneftigo-grey)", fontSize: "12px", width: "40px", height: "16px", padding: "0px 6px 0 6px", margin: "auto 12px auto 24px", borderColor:"var(--eneftigo-dark-grey)", borderWidth:"1px", borderStyle:"solid" }}>{showingMore ? "LESS" : "MORE"}</button> :
                    <div style={{width:"40px", margin:"auto 12px auto 24px"}}></div>
                }
            </div>
        </div>
    );
}