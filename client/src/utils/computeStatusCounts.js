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
}
