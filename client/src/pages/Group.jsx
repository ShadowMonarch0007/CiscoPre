import { useEffect, useMemo, useState } from "react";
import {
  getGroup,
  addMember,
  addExpense,
  getSummary,
  getSettlements,
  getLogs
} from "../api/client";
import MembersCard from "../components/MembersCard.jsx";
import AddMemberForm from "../components/AddMemberForm.jsx";
import AddExpenseForm from "../components/AddExpenseForm.jsx";
import SummaryCard from "../components/SummaryCard.jsx";
import SettlementsCard from "../components/SettlementsCard.jsx";
import LogsCard from "../components/LogsCard.jsx";

export default function Group({ groupId, onBack }) {
  const [group, setGroup] = useState(null);
  const [summary, setSummary] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const g = await getGroup(groupId);
    setGroup(g);
    const s = await getSummary(groupId);
    setSummary(s);
    const st = await getSettlements(groupId);
    setSettlements(st.settlements || []);
    const lg = await getLogs(groupId);
    setLogs(lg.logs || []);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, [groupId]);

  async function handleAddMember(name) {
    await addMember(groupId, name);
    await refresh();
  }

  async function handleAddExpense(payload) {
    await addExpense(groupId, payload);
    await refresh();
  }

  const membersMap = useMemo(() => {
    const m = {};
    if (group?.members) for (const x of group.members) m[x._id] = x.name;
    return m;
  }, [group]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-600">
          Group ID: <code>{groupId}</code>
        </div>
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back
        </button>
      </div>

      {loading ? (
        <div className="card">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <MembersCard members={group.members || []} />
            <AddMemberForm onAdd={handleAddMember} />
            <AddExpenseForm members={group.members || []} onAdd={handleAddExpense} />
            <LogsCard logs={logs} membersMap={membersMap} />
          </div>
          <div className="space-y-4">
            <SummaryCard members={group.members || []} summary={summary} />
            <SettlementsCard settlements={settlements} membersMap={membersMap} />
          </div>
        </div>
      )}
    </div>
  );
}
