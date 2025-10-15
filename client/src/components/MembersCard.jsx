export default function MembersCard({ members }) {
  return (
    <div className="card">
      <div className="font-semibold mb-2">Members</div>
      {members?.length ? (
        <ul className="space-y-1">
          {members.map(m => (
            <li key={m._id} className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-white text-sm">
                {m.name[0]?.toUpperCase() || "?"}
              </span>
              <span>{m.name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-neutral-500">No members yet.</div>
      )}
    </div>
  )
}
