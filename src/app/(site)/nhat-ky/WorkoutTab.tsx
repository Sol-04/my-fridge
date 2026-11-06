"use client";

import { useState } from "react";

import { ACTIVITIES, ACTIVITY_BY_KEY, PLACE_LABEL, SPORTS } from "../../../../data/activities";
import { Chip, TextField } from "@/components/form";
import { Icon, Icons } from "@/components/icons";
import { buttonClass, cardClass, Notice, PendingDots } from "@/components/ui";
import { type WorkoutLog, type WorkoutPlanRow } from "@/lib/diary";
import {
  buildWeekPlan,
  burnedCalories,
  circuitLogKey,
  CIRCUITS,
  WEEKDAY_LABELS,
  weekdayIndex,
  WORKOUT_GOALS,
  WORKOUT_LEVELS,
  type PlanSession,
  type WorkoutGoal,
  type WorkoutLevel,
} from "@/lib/workout-plan";

import { addWorkoutLog, deleteWorkoutLog, saveWorkoutPlan } from "./actions";
import { selectClass, useDiaryRun } from "./useDiaryRun";

const kcalBadge = "inline-flex items-center gap-1 rounded-lg bg-accent-50 px-2 py-1 text-sm font-bold text-accent-500";
const SHORT_DAY = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

type Props = {
  date: string;
  plan: WorkoutPlanRow | null;
  workouts: WorkoutLog[];
  weightKg: number;
  usingDefaultWeight: boolean;
  isToday: boolean;
};

export function WorkoutTab({ date, plan, workouts, weightKg, usingDefaultWeight, isToday }: Props) {
  const [editing, setEditing] = useState(false);
  const [shifts, setShifts] = useState<Record<number, number>>({});

  return (
    <div className="space-y-4">
      {usingDefaultWeight && (
        <p className="text-sm text-muted">Tạm tính theo 60 kg — cập nhật cân nặng ở Hồ sơ để chính xác hơn</p>
      )}

      {!plan || editing ? (
        <PlanForm initial={plan} onDone={() => setEditing(false)} onCancel={plan ? () => setEditing(false) : undefined} />
      ) : (
        <PlanView
          date={date}
          isToday={isToday}
          plan={plan}
          shifts={shifts}
          onShift={(wd) => setShifts((s) => ({ ...s, [wd]: (s[wd] ?? 0) + 1 }))}
          weightKg={weightKg}
          onEdit={() => setEditing(true)}
        />
      )}

      <LoggedList workouts={workouts} />
      <AddOther date={date} weightKg={weightKg} />
    </div>
  );
}

// ---------- Chọn mục tiêu / trình độ / môn thích ----------
function PlanForm({ initial, onDone, onCancel }: { initial: WorkoutPlanRow | null; onDone: () => void; onCancel?: () => void }) {
  const [goal, setGoal] = useState<WorkoutGoal | null>(initial?.goal ?? null);
  const [level, setLevel] = useState<WorkoutLevel | null>(initial?.level ?? null);
  const [favs, setFavs] = useState<string[]>(initial?.favorite_activities ?? []);
  const { pending, error, run } = useDiaryRun();
  const toggle = (k: string) => setFavs((f) => (f.includes(k) ? f.filter((x) => x !== k) : [...f, k]));

  return (
    <section aria-labelledby="plan-form" className={`animate-enter space-y-5 p-4 sm:p-5 ${cardClass}`}>
      <div>
        <h2 id="plan-form" className="text-xl font-bold text-ink">
          Lập lịch tập cho bạn
        </h2>
        <p className="mt-1 text-sm text-muted">Chọn mục tiêu và trình độ, web sẽ gợi ý lịch tập trong tuần.</p>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-ink">Mục tiêu</legend>
        <div className="mt-1 grid grid-cols-1 gap-2">
          {WORKOUT_GOALS.map((g) => (
            <Chip key={g.value} stacked active={goal === g.value} onClick={() => setGoal(g.value)}>
              <span className="block">{g.label}</span>
              <span className={`block text-xs font-normal ${goal === g.value ? "text-brand-100" : "text-muted"}`}>{g.hint}</span>
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-ink">Trình độ</legend>
        <div className="mt-1 grid grid-cols-1 gap-2">
          {WORKOUT_LEVELS.map((l) => (
            <Chip key={l.value} stacked active={level === l.value} onClick={() => setLevel(l.value)}>
              <span className="block">{l.label}</span>
              <span className={`block text-xs font-normal ${level === l.value ? "text-brand-100" : "text-muted"}`}>{l.hint}</span>
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-ink">Môn thể thao bạn thích (không bắt buộc)</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SPORTS.map((s) => (
            <Chip key={s.key} active={favs.includes(s.key)} onClick={() => toggle(s.key)}>
              {favs.includes(s.key) && <Icon icon={Icons.check} size={16} strokeWidth={2.25} />}
              {s.name}
            </Chip>
          ))}
        </div>
      </fieldset>

      {error && <Notice tone="error">{error}</Notice>}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={pending || !goal || !level}
          onClick={() => goal && level && run(() => saveWorkoutPlan({ goal, level, favorites: favs }), onDone)}
          className={buttonClass("primary", "md", "w-full sm:w-auto")}
        >
          {pending ? (
            <>
              Đang lưu…
              <PendingDots />
            </>
          ) : (
            <>
              <Icon icon={Icons.save} size={18} />
              Lưu lịch tập
            </>
          )}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={buttonClass("ghost", "md", "w-full sm:w-auto")}>
            Huỷ
          </button>
        )}
      </div>
    </section>
  );
}

// ---------- Lịch hôm nay + lịch tuần ----------
function PlanView({
  date,
  isToday,
  plan,
  shifts,
  onShift,
  weightKg,
  onEdit,
}: {
  date: string;
  isToday: boolean;
  plan: WorkoutPlanRow;
  shifts: Record<number, number>;
  onShift: (weekday: number) => void;
  weightKg: number;
  onEdit: () => void;
}) {
  const week = buildWeekPlan(plan.goal, plan.level, plan.favorite_activities, shifts);
  const wd = weekdayIndex(date);
  const session = week[wd];
  const goalLabel = WORKOUT_GOALS.find((g) => g.value === plan.goal)?.label;
  const levelLabel = WORKOUT_LEVELS.find((l) => l.value === plan.level)?.label;

  return (
    <>
      <section aria-labelledby="today-plan" className={`animate-enter p-4 sm:p-5 ${cardClass}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="today-plan" className="text-lg font-bold text-ink">
              {isToday ? "Hôm nay" : "Buổi tập"} ({WEEKDAY_LABELS[wd]})
            </h2>
            <p className="text-sm text-muted">
              {goalLabel} · {levelLabel}
            </p>
          </div>
          <button type="button" onClick={onEdit} className="inline-flex min-h-11 shrink-0 items-center rounded-xl px-3 text-sm font-semibold text-brand-700 hover:bg-brand-50">
            Đổi mục tiêu
          </button>
        </div>

        <div className="mt-4">
          {session.type === "rest" ? (
            <div className="flex items-center gap-3 rounded-2xl bg-aqua-50 p-4 text-aqua-800">
              <Icon icon={Icons.sparkles} size={22} />
              <p className="font-semibold">Nghỉ ngơi / giãn cơ nhẹ</p>
            </div>
          ) : (
            <SessionCard key={`${date}-${shifts[wd] ?? 0}`} date={date} session={session} weightKg={weightKg} />
          )}
        </div>

        {session.type !== "rest" && (
          <button type="button" onClick={() => onShift(wd)} className={buttonClass("secondary", "md", "mt-3 w-full sm:w-auto")}>
            <Icon icon={Icons.swap} size={18} />
            Gợi ý khác
          </button>
        )}
      </section>

      <section aria-labelledby="week-plan" className={`animate-enter p-4 sm:p-5 ${cardClass}`}>
        <h2 id="week-plan" className="text-lg font-bold text-ink">
          Lịch tuần
        </h2>
        <ol className="mt-3 grid grid-cols-7 gap-1.5">
          {week.map((s, i) => {
            const current = i === wd;
            const rest = s.type === "rest";
            return (
              <li
                key={i}
                aria-current={current ? "date" : undefined}
                className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2 text-center ${
                  current ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white text-ink"
                }`}
              >
                <span className="text-sm font-bold">
                  <span aria-hidden>{SHORT_DAY[i]}</span>
                  <span className="sr-only">{WEEKDAY_LABELS[i]}</span>
                </span>
                <span className={`text-xs ${current ? "text-brand-50" : rest ? "text-muted" : "font-semibold text-brand-700"}`}>
                  {rest ? "Nghỉ" : "Tập"}
                </span>
              </li>
            );
          })}
        </ol>
      </section>
    </>
  );
}

function SessionCard({ date, session, weightKg }: { date: string; session: Exclude<PlanSession, { type: "rest" }>; weightKg: number }) {
  const [minutes, setMinutes] = useState(String(session.minutes));
  const { pending, error, run } = useDiaryRun();
  const [done, setDone] = useState(false);
  const min = Number(minutes);
  const validMin = Number.isFinite(min) && min >= 1 && min <= 600;

  const isSport = session.type === "sport";
  const met = isSport ? session.activity.met : CIRCUITS[session.key].met;
  const key = isSport ? session.activity.key : circuitLogKey(session.key);
  const kcal = validMin ? burnedCalories(met, weightKg, min) : 0;

  return (
    <div className="rounded-2xl border border-line p-4">
      {isSport ? (
        <>
          <p className="text-lg font-bold text-ink">{session.activity.name}</p>
          <p className="mt-0.5 text-sm text-muted">Nơi tập: {PLACE_LABEL[session.activity.place]}</p>
          <p className="mt-2 text-sm text-ink">{session.activity.tip}</p>
        </>
      ) : (
        <>
          <p className="text-lg font-bold text-ink">{session.name}</p>
          <ul className="mt-2 space-y-2">
            {session.exercises.map((e) => (
              <li key={e.activity.key} className="rounded-xl bg-canvas p-3">
                <p className="font-semibold text-ink">
                  {e.activity.name} — {e.sets} hiệp × {e.amount} {e.unit === "seconds" ? "giây" : "lần"}
                </p>
                <p className="mt-0.5 text-sm text-muted">{e.activity.tip}</p>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-4 grid grid-cols-[1fr_auto] items-end gap-3">
        <TextField label="Số phút" type="number" inputMode="numeric" min={1} max={600} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
        <span className={`${kcalBadge} mb-4`}>
          <Icon icon={Icons.calories} size={14} />~{kcal} kcal
        </span>
      </div>

      {error && (
        <div className="mb-3">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      {done && (
        <div className="mb-3">
          <Notice tone="success">Đã ghi vào nhật ký. Giỏi lắm!</Notice>
        </div>
      )}
      <button
        type="button"
        disabled={pending || !validMin || done}
        onClick={() => run(() => addWorkoutLog({ date, activityKey: key, minutes: min }), () => setDone(true))}
        className={buttonClass("primary", "md", "w-full sm:w-auto")}
      >
        {pending ? (
          <>
            Đang lưu…
            <PendingDots />
          </>
        ) : (
          <>
            <Icon icon={Icons.check} size={18} />
            Đã tập
          </>
        )}
      </button>
    </div>
  );
}

// ---------- Hoạt động đã ghi ----------
function LoggedList({ workouts }: { workouts: WorkoutLog[] }) {
  const { pending, error, run } = useDiaryRun();
  return (
    <section aria-labelledby="logged" className={`animate-enter p-4 sm:p-5 ${cardClass}`}>
      <h2 id="logged" className="text-lg font-bold text-ink">
        Đã tập trong ngày
      </h2>
      {error && (
        <div className="mt-3">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      {workouts.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Chưa ghi hoạt động nào</p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {workouts.map((w) => (
            <li key={w.id} className="flex items-center gap-2 py-2">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{w.name}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-muted">
                  {w.minutes} phút
                  <span className={kcalBadge}>
                    <Icon icon={Icons.calories} size={14} />
                    {Math.round(w.calories)} kcal
                  </span>
                </p>
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => deleteWorkoutLog(w.id))}
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-2xl text-muted transition duration-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
              >
                <Icon icon={Icons.trash} size={18} />
                <span className="sr-only">Xoá {w.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ---------- Thêm hoạt động khác ----------
function AddOther({ date, weightKg }: { date: string; weightKg: number }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"library" | "custom">("library");
  const [key, setKey] = useState(ACTIVITIES[0].key);
  const [minutes, setMinutes] = useState("30");
  const [name, setName] = useState("");
  const [cal, setCal] = useState("");
  const { pending, error, run } = useDiaryRun();

  const min = Number(minutes);
  const validMin = Number.isFinite(min) && min >= 1 && min <= 600;
  const act = ACTIVITY_BY_KEY.get(key);
  const est = act && validMin ? burnedCalories(act.met, weightKg, min) : 0;
  const reset = () => {
    setOpen(false);
    setName("");
    setCal("");
  };

  return (
    <section aria-labelledby="add-other" className={`animate-enter p-4 sm:p-5 ${cardClass}`}>
      <h2 id="add-other" className="sr-only">
        Thêm hoạt động khác
      </h2>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className={buttonClass("secondary", "md", "w-full sm:w-auto")}>
          <Icon icon={Icons.add} size={18} />
          Thêm hoạt động khác
        </button>
      ) : (
        <div className="space-y-3">
          <div role="group" aria-label="Cách thêm hoạt động" className="grid grid-cols-2 gap-2">
            <Chip active={mode === "library"} onClick={() => setMode("library")}>
              Chọn từ thư viện
            </Chip>
            <Chip active={mode === "custom"} onClick={() => setMode("custom")}>
              Tự nhập
            </Chip>
          </div>

          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              run(
                () =>
                  mode === "library"
                    ? addWorkoutLog({ date, activityKey: key, minutes: min })
                    : addWorkoutLog({ date, name, minutes: min, calories: cal.trim() === "" ? null : Number(cal) }),
                reset,
              );
            }}
          >
            {mode === "library" ? (
              <label className="block">
                <span className="text-sm font-semibold text-ink">Hoạt động</span>
                <select value={key} onChange={(e) => setKey(e.target.value)} className={`${selectClass} mt-1 min-h-14`}>
                  <optgroup label="Môn thể thao">
                    {SPORTS.map((a) => (
                      <option key={a.key} value={a.key}>
                        {a.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Bài tập">
                    {ACTIVITIES.filter((a) => a.kind === "exercise").map((a) => (
                      <option key={a.key} value={a.key}>
                        {a.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </label>
            ) : (
              <TextField label="Tên hoạt động" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} required />
            )}

            <TextField label="Số phút" type="number" inputMode="numeric" min={1} max={600} value={minutes} onChange={(e) => setMinutes(e.target.value)} required />

            {mode === "custom" ? (
              <TextField
                label="Calo đốt (kcal) — không bắt buộc"
                type="number"
                inputMode="decimal"
                min={0}
                max={5000}
                value={cal}
                onChange={(e) => setCal(e.target.value)}
                hint="Để trống, web sẽ tự ước tính theo cân nặng và số phút."
              />
            ) : (
              <p className="flex items-center gap-2 text-sm text-muted">
                Ước tính đốt
                <span className={kcalBadge}>
                  <Icon icon={Icons.calories} size={14} />~{est} kcal
                </span>
              </p>
            )}

            {error && <Notice tone="error">{error}</Notice>}

            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="submit" disabled={pending || !validMin || (mode === "custom" && !name.trim())} className={buttonClass("secondary", "md", "w-full sm:w-auto")}>
                {pending ? (
                  <>
                    Đang lưu…
                    <PendingDots />
                  </>
                ) : (
                  "Thêm vào nhật ký"
                )}
              </button>
              <button type="button" onClick={() => setOpen(false)} className={buttonClass("ghost", "md", "w-full sm:w-auto")}>
                Đóng
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
