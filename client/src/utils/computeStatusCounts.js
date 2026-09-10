// Takes the `members` array from GET /teams/mine/progress (each member has
// an `enrollments` array, each enrollment has a `status` of 'not_started' |
// 'in_progress' | 'completed') and returns data shaped for Recharts' <Pie>:
//   [{ name: 'Not Started', value: 5 }, { name: 'In Progress', value: 2 }, ...]
// Only include a status in the result if its count is > 0 (Recharts renders
// an empty/zero slice oddly otherwise).
export function computeStatusCounts(members) {
  // TODO: flatten every member's enrollments into one list, count how many
  // have each status, then map those counts into the [{ name, value }] shape
  // described above.
  const dict = {
    Completed: 0,
    "Not Started": 0,
    "In Progress": 0,
  };
  for (const member of members) {
    for (const enrollment of member.enrollments) {
      if (enrollment.status === "completed") {
        dict["Completed"] += 1;
      } else if (enrollment.status === "not_started") {
        dict["Not Started"] += 1;
      } else if (enrollment.status === "in_progress") {
        dict["In Progress"] += 1;
      }
    }
  }
  const ret = Object.entries(dict)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => {
      return { name: name, value: value };
    });
  return ret;
}
