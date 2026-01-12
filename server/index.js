import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

/* =========================
   Health Check
========================= */
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.get("/test-db", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: "connected" });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/* =========================
   TEAMS
========================= */

// جلب كل الفرق
app.get("/api/teams", async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    res.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

// إنشاء فريق جديد مع لاعبين ✅
app.post("/api/teams", async (req, res) => {
  const { name, playerIds } = req.body;

  if (!name || !Array.isArray(playerIds) || playerIds.length !== 2) {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    const team = await prisma.team.create({
      data: {
        name,
        players: {
          connect: playerIds.map((id) => ({ id })),
        },
      },
      include: {
        players: true,
      },
    });

    res.json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create team" });
  }
});

/* =========================
   PLAYERS
========================= */

// ✅ جلب كل اللاعبين أو حسب فريق
app.get("/api/players", async (req, res) => {
  const teamId = Number(req.query.teamId);

  try {
    const players = await prisma.player.findMany({
      where: teamId
        ? {
            teams: {
              some: { id: teamId },
            },
          }
        : undefined,
      select: {
        id: true,
        name: true,
      },
    });

    res.json(players);
  } catch (error) {
    console.error("Error fetching players:", error);
    res.status(500).json({ error: "Failed to fetch players" });
  }
});

// ✅ إضافة لاعب جديد
app.post("/api/players", async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Player name is required" });
  }

  try {
    const existingPlayer = await prisma.player.findFirst({
      where: { name: name.trim() },
    });

    if (existingPlayer) {
      return res.status(409).json({ error: "Player already exists" });
    }

    const player = await prisma.player.create({
      data: {
        name: name.trim(),
      },
    });

    res.json(player);
  } catch (error) {
    console.error("Error creating player:", error);
    res.status(500).json({ error: "Failed to create player" });
  }
});

/* =========================
   MATCHES
========================= */

// إنشاء مباراة
app.post("/api/matches", async (req, res) => {
  const { teamA_id, teamB_id, match_date, starter_player_id, notes } = req.body;

  if (!teamA_id || !teamB_id || !match_date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const parsedDate = new Date(match_date);
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ error: "Invalid match date" });
  }

  try {
    const match = await prisma.match.create({
      data: {
        teamA_id: Number(teamA_id),
        teamB_id: Number(teamB_id),
        match_date: parsedDate,
        starter_player_id: starter_player_id
          ? Number(starter_player_id)
          : null,
        winner_team_id: null,
        final_score: 0,
        notes: notes || "",
      },
    });

    res.json(match);
  } catch (error) {
    console.error("Error creating match:", error);
    res.status(500).json({ error: "Failed to create match" });
  }
});

/* =========================
   GET MATCH WITH PLAYERS ✅
========================= */
app.get("/api/matches/:id", async (req, res) => {
  const matchId = Number(req.params.id);

  if (!matchId) {
    return res.status(400).json({ error: "Invalid match id" });
  }

  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        teamA: {
          include: {
            players: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        teamB: {
          include: {
            players: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    res.json(match);
  } catch (error) {
    console.error("Error fetching match:", error);
    res.status(500).json({ error: "Failed to fetch match" });
  }
});

/* =========================
   RESULTS
========================= */
app.get("/api/results/all-dates", async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      select: { match_date: true },
      orderBy: { match_date: "desc" },
    });

    const dates = matches.map((m) =>
      m.match_date.toISOString().split("T")[0]
    );
    res.json(dates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch dates" });
  }
});

/* =========================
   GET PLAYERS OF A MATCH
========================= */
app.get("/api/matches/:id/players", async (req, res) => {
  const matchId = Number(req.params.id);
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      teamA: { include: { players: true } },
      teamB: { include: { players: true } },
    },
  });

  const players = [...match.teamA.players, ...match.teamB.players];
  res.json(players);
});

/* =========================
   UPDATE MATCH (ROUNDS + FINISH)
========================= */
app.put("/api/matches/:id", async (req, res) => {
  const matchId = Number(req.params.id);
  const { starter_player_id, rounds, finish } = req.body;

  if (!matchId) {
    return res.status(400).json({ error: "Invalid match id" });
  }

  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { rounds: true },
    });

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    if (starter_player_id) {
      await prisma.match.update({
        where: { id: matchId },
        data: { starter_player_id: Number(starter_player_id) },
      });
    }

    if (Array.isArray(rounds)) {
      const existingRoundsCount = match.rounds.length;

      for (let i = 0; i < rounds.length; i++) {
        const r = rounds[i];
        const nextRoundNumber = existingRoundsCount + i + 1;

        if (nextRoundNumber > 21) break;

        if (nextRoundNumber === 21) {
          const round20 = match.rounds.find(
            (round) => round.round_number === 20
          );

          if (!round20 || round20.round_score !== 0) {
            break;
          }
        }

        await prisma.round.create({
          data: {
            match_id: matchId,
            round_number: nextRoundNumber,
            game_type: r.game_type,
            round_score: Number(r.round_score),
            round_details: r.round_details || null,
          },
        });
      }
    }

    if (finish === true) {
      const lastRound = await prisma.round.findFirst({
        where: { match_id: matchId },
        orderBy: { round_number: "desc" },
      });

      const finalScore = lastRound ? lastRound.round_score : 0;

      let winnerTeamId = null;

      if (finalScore > 0) winnerTeamId = match.teamA_id;
      else if (finalScore < 0) winnerTeamId = match.teamB_id;

      await prisma.match.update({
        where: { id: matchId },
        data: {
          final_score: finalScore,
          winner_team_id: winnerTeamId,
        },
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("UPDATE MATCH ERROR:", error);
    res.status(500).json({ error: "Failed to update match" });
  }
});

/* =========================
   GET RESULTS BY DATE
========================= */
app.get("/api/results", async (req, res) => {
  const { year, month, day } = req.query;

  if (!year || !month || !day) {
    return res.status(400).json({ error: "Missing date params" });
  }

  const start = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  const end = new Date(`${year}-${month}-${day}T23:59:59.999Z`);

  try {
    const matches = await prisma.match.findMany({
      where: {
        match_date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        teamA: {
          include: {
            players: { select: { id: true, name: true } },
          },
        },
        teamB: {
          include: {
            players: { select: { id: true, name: true } },
          },
        },
        rounds: true,
      },
      orderBy: { match_date: "asc" },
    });

    // جلب أسماء starter player والفريق الفائز لكل مباراة
    const matchesWithNames = await Promise.all(
      matches.map(async (m) => {
        let starterName = "غير محدد";
        let winnerName = "لم يُحدد";

        if (m.starter_player_id) {
          const player = await prisma.player.findUnique({
            where: { id: m.starter_player_id },
            select: { name: true },
          });
          if (player) starterName = player.name;
        }

        if (m.winner_team_id) {
          const team = await prisma.team.findUnique({
            where: { id: m.winner_team_id },
            select: { name: true },
          });
          if (team) winnerName = team.name;
        }

        return { ...m, starterName, winnerName };
      })
    );

    res.json(matchesWithNames);
  } catch (error) {
    console.error("RESULTS ERROR:", error);
    res.status(500).json({ error: "Failed to fetch results" });
  }
});


/* =========================
   GET ALL PLAYERS WITH TEAMS ✅
========================= */
app.get("/api/players-with-teams", async (req, res) => {
  try {
    const players = await prisma.player.findMany({
      select: {
        id: true,
        name: true,
        teams: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(players);
  } catch (error) {
    console.error("Error fetching players with teams:", error);
    res.status(500).json({ error: "Failed to fetch players with teams" });
  }
});

/* =========================
   TEAM STATS
========================= */
app.get("/api/stats/team/:teamId", async (req, res) => {
  const teamId = Number(req.params.teamId);

  try {
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { teamA_id: teamId },
          { teamB_id: teamId }
        ]
      },
      include: {
        teamA: true,
        teamB: true,
        rounds: true
      }
    });

    const totalMatches = matches.length;
    let wins = 0;
    let opponentCount = {};
    let minWinRounds = null;
    let minLoseRounds = null;

    matches.forEach(match => {
      const isWinner = match.winner_team_id === teamId;

      const roundCount = match.rounds ? match.rounds.length : 0;

      if (isWinner) {
        wins++;
        if (minWinRounds === null || roundCount < minWinRounds) {
          minWinRounds = roundCount;
        }
      } else {
        if (minLoseRounds === null || roundCount < minLoseRounds) {
          minLoseRounds = roundCount;
        }
      }

      const opponentName = match.teamA_id === teamId
        ? (match.teamB ? match.teamB.name : null)
        : (match.teamA ? match.teamA.name : null);

      if (opponentName) {
        opponentCount[opponentName] = (opponentCount[opponentName] || 0) + 1;
      }
    });

    const losses = totalMatches - wins;

    const mostPlayedAgainst = Object.entries(opponentCount)
      .sort((a, b) => b[1] - a[1])[0]
      ?.[0] || null;

    const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(2) : "0";

    res.json({
      totalMatches,
      wins,
      losses,
      winRate,
      mostPlayedAgainst,
      minWinRounds,
      minLoseRounds
    });
  } catch (error) {
    console.error("TEAM STATS ERROR:", error);
    res.status(500).json({
      error: "خطأ في جلب إحصائيات الفريق",
      details: error.message
    });
  }
});


/* =========================
   PLAYER STATS
========================= */
app.get("/api/stats/player/:playerId", async (req, res) => {
  const playerId = Number(req.params.playerId);

  try {
    // نحصل على جميع الفرق التي ينتمي إليها اللاعب
    const playerTeams = await prisma.player.findUnique({
      where: { id: playerId },
      include: { teams: true }
    });

    if (!playerTeams) {
      return res.status(404).json({ error: "اللاعب غير موجود" });
    }

    const teamIds = playerTeams.teams.map(t => t.id);

    // نجد كل المباريات التي كان فريقه فيها طرفاً
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { teamA_id: { in: teamIds } },
          { teamB_id: { in: teamIds } }
        ]
      },
      include: {
        teamA: { include: { players: true } }, // ✅ إضافة اللاعبين
        teamB: { include: { players: true } }, // ✅ إضافة اللاعبين
        rounds: true
      }
    });

    const totalMatches = matches.length;
    let wins = 0;
    let opponentCount = {};
    let minWinRounds = null;
    let minLoseRounds = null;

    matches.forEach(match => {
      const playerTeamId = teamIds.includes(match.teamA_id) ? match.teamA_id : match.teamB_id;
      const isWinner = match.winner_team_id === playerTeamId;
      const roundCount = match.rounds ? match.rounds.length : 0;

      if (isWinner) {
        wins++;
        if (minWinRounds === null || roundCount < minWinRounds) minWinRounds = roundCount;
      } else {
        if (minLoseRounds === null || roundCount < minLoseRounds) minLoseRounds = roundCount;
      }

      // ✅ حساب أكثر لاعب لعب ضده
      const opponentPlayers = playerTeamId === match.teamA_id ? match.teamB.players : match.teamA.players;
      opponentPlayers.forEach(opponent => {
        if (opponent.id !== playerId) {
          opponentCount[opponent.name] = (opponentCount[opponent.name] || 0) + 1;
        }
      });
    });

    const losses = totalMatches - wins;
    const mostPlayedAgainst = Object.entries(opponentCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(2) : "0";

    res.json({
      totalMatches,
      wins,
      losses,
      winRate,
      mostPlayedAgainst,
      minWinRounds,
      minLoseRounds
    });
  } catch (error) {
    console.error("PLAYER STATS ERROR:", error);
    res.status(500).json({
      error: "خطأ في جلب إحصائيات اللاعب",
      details: error.message
    });
  }
});


/* =========================
   GENERAL STATS
========================= */
app.get("/api/stats/general", async (req, res) => {
  const type = req.query.type; // teams | players

  if (!["teams", "players"].includes(type)) {
    return res.status(400).json({ error: "نوع الإحصائيات غير صالح" });
  }

  try {
    /* =========================
       Load Entities
    ========================= */
    const entities =
      type === "teams"
        ? await prisma.team.findMany()
        : await prisma.player.findMany({
            include: { teams: true },
          });

    const results = {
      mostWins: [],
      mostLosses: [],
      mostMatches: [],
      bestWinRoundsAvg: [],
      worstWinRoundsAvg: [],
      mostDifferentOpponents: [],
      mostStarters: [],
      starterWins: [],
      starterLosses: [],
    };

    /* =========================
       Iterate Entities
    ========================= */
    for (const entity of entities) {
      let matches = [];
      let entityId = entity.id;

      if (type === "teams") {
        matches = await prisma.match.findMany({
          where: {
            OR: [
              { teamA_id: entityId },
              { teamB_id: entityId },
            ],
          },
          include: { rounds: true },
        });
      } else {
        const teamIds = entity.teams.map(t => t.id);

        matches = await prisma.match.findMany({
          where: {
            OR: [
              { teamA_id: { in: teamIds } },
              { teamB_id: { in: teamIds } },
            ],
          },
          include: { rounds: true },
        });
      }

      const totalMatches = matches.length;
      if (totalMatches === 0) continue;

      let wins = 0;
      let losses = 0;
      let starters = 0;
      let starterWins = 0;
      let starterLosses = 0;

      let winRoundsTotal = 0;
      let winRoundsCount = 0;

      const opponents = new Set();

      matches.forEach(match => {
        const isTeamA =
          type === "teams"
            ? match.teamA_id === entityId
            : entity.teams.some(t => t.id === match.teamA_id);

        const myTeamId = isTeamA ? match.teamA_id : match.teamB_id;
        const opponentId = isTeamA ? match.teamB_id : match.teamA_id;

        opponents.add(opponentId);

        const isWinner = match.winner_team_id === myTeamId;

        if (isWinner) {
          wins++;
          winRoundsTotal += match.rounds.length;
          winRoundsCount++;
        } else {
          losses++;
        }

        if (match.starter_player_id === entityId) {
          starters++;
          isWinner ? starterWins++ : starterLosses++;
        }
      });

      const winRate = (wins / totalMatches) * 100;
      const lossRate = (losses / totalMatches) * 100;
      const winRoundsAvg =
        winRoundsCount > 0 ? winRoundsTotal / winRoundsCount : null;

      const name = entity.name;

      results.mostWins.push({ id: entityId, name, value: Number(winRate.toFixed(2)) });
      results.mostLosses.push({ id: entityId, name, value: Number(lossRate.toFixed(2)) });
      results.mostMatches.push({ id: entityId, name, value: totalMatches });

      if (winRoundsAvg !== null) {
        results.bestWinRoundsAvg.push({ id: entityId, name, value: Number(winRoundsAvg.toFixed(2)) });
        results.worstWinRoundsAvg.push({ id: entityId, name, value: Number(winRoundsAvg.toFixed(2)) });
      }

      results.mostDifferentOpponents.push({
        id: entityId,
        name,
        value: opponents.size,
      });

      results.mostStarters.push({ id: entityId, name, value: starters });
      results.starterWins.push({ id: entityId, name, value: starterWins });
      results.starterLosses.push({ id: entityId, name, value: starterLosses });
    }

    /* =========================
       Sort & Build Response
    ========================= */
    const sortDesc = arr => arr.sort((a, b) => b.value - a.value);
    const sortAsc = arr => arr.sort((a, b) => a.value - b.value);

    const response = [
      {
        key: "mostWins",
        title: `أكثر ${type === "teams" ? "فريق" : "لاعب"} فوزًا`,
        unit: "%",
        highlightLabel: "نسبة الفوز",
        list: sortDesc(results.mostWins),
      },
      {
        key: "mostLosses",
        title: `أكثر ${type === "teams" ? "فريق" : "لاعب"} خسارة`,
        unit: "%",
        highlightLabel: "نسبة الخسارة",
        list: sortDesc(results.mostLosses),
      },
      {
        key: "mostMatches",
        title: `أكثر ${type === "teams" ? "فريق" : "لاعب"} شارك بالمسابقات`,
        unit: "count",
        highlightLabel: "عدد المسابقات",
        list: sortDesc(results.mostMatches),
      },
      {
        key: "bestWinRoundsAvg",
        title: "أفضل معدل جولات في الفوز",
        unit: "average",
        highlightLabel: "متوسط الجولات",
        list: sortAsc(results.bestWinRoundsAvg),
      },
      {
        key: "worstWinRoundsAvg",
        title: "أسوأ معدل جولات في الفوز",
        unit: "average",
        highlightLabel: "متوسط الجولات",
        list: sortDesc(results.worstWinRoundsAvg),
      },
      {
        key: "mostDifferentOpponents",
        title: `أكثر ${type === "teams" ? "فريق" : "لاعب"} فاز على خصوم مختلفين`,
        unit: "count",
        highlightLabel: "عدد الخصوم",
        list: sortDesc(results.mostDifferentOpponents),
      },
      {
        key: "mostStarters",
        title: `أكثر ${type === "teams" ? "فريق" : "لاعب"} بدأ اللعب`,
        unit: "count",
        highlightLabel: "عدد المرات",
        list: sortDesc(results.mostStarters),
      },
      {
        key: "starterWins",
        title: "بدأ اللعب وفاز",
        unit: "count",
        highlightLabel: "عدد المسابقات",
        list: sortDesc(results.starterWins),
      },
      {
        key: "starterLosses",
        title: "بدأ اللعب وخسر",
        unit: "count",
        highlightLabel: "عدد المسابقات",
        list: sortDesc(results.starterLosses),
      },
    ];

    res.json(response);
  } catch (error) {
    console.error("GENERAL STATS ERROR:", error);
    res.status(500).json({
      error: "خطأ في جلب الإحصائيات العامة",
      details: error.message,
    });
  }
});

/* =========================
   GET PLAYER BY ID
========================= */
app.get("/api/player/:id", async (req, res) => {
  const playerId = Number(req.params.id);
  if (!playerId) return res.status(400).json({ error: "Player ID required" });

  try {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      select: { id: true, name: true },
    });

    if (!player) return res.status(404).json({ error: "Player not found" });

    res.json(player);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch player" });
  }
});

/* =========================
   GET TEAM BY ID
========================= */
app.get("/api/team/:id", async (req, res) => {
  const teamId = Number(req.params.id);
  if (!teamId) return res.status(400).json({ error: "Team ID required" });

  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true, name: true },
    });

    if (!team) return res.status(404).json({ error: "Team not found" });

    res.json(team);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch team" });
  }
});

/* =========================
   START SERVER
========================= */
app.listen(3000, () => {
  console.log("Server running on http://trix-server-r52j.onrender.com/");
});
