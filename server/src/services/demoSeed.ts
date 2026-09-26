import { v4 as uuid } from "uuid";
import { getSession } from "./neo4j";

export const DEMO_USER_ID = "demo-user";

export async function clearUserData(userId: string): Promise<void> {
  const session = getSession();
  try {
    await session.run(
      `MATCH (u:User {id: $userId})
       OPTIONAL MATCH (u)-[*0..3]-(n)
       WHERE n.userId = $userId OR n:User
       DETACH DELETE n`,
      { userId }
    );
  } finally {
    await session.close();
  }
}

export async function seedDemoData(userId: string = DEMO_USER_ID): Promise<void> {
  await clearUserData(userId);
  const session = getSession();
  const id = () => uuid();

  const ids = {
    prefMorning: id(),
    prefNoEarlyMeetings: id(),
    prefFocusSessions: id(),
    taskPresentation: id(),
    taskProject: id(),
    taskInternshipApp: id(),
    decisionPresentation: id(),
    decisionProject: id(),
    decisionInternship: id(),
    reasonPresentation1: id(),
    reasonPresentation2: id(),
    expLateStress: id(),
    expEarlyGood: id(),
    outcomeProjectDone: id(),
    goalInternship: id(),
    goalProductivity: id(),
    goalProjects: id(),
  };

  try {
    await session.run(
      `MERGE (u:User {id: $userId}) SET u.createdAt = datetime()

       CREATE (prefMorning:Preference {id: $prefMorning, userId: $userId, content: "Important work is best done in the morning", type: "work_time", confidence: 0.95, importance: 0.9, status: "active", source: "demo", createdAt: datetime(), updatedAt: datetime()})
       CREATE (prefNoEarly:Preference {id: $prefNoEarlyMeetings, userId: $userId, content: "No meetings before 9 AM", type: "meeting_time", confidence: 0.9, importance: 0.6, status: "active", source: "demo", createdAt: datetime(), updatedAt: datetime()})
       CREATE (prefFocus:Preference {id: $prefFocusSessions, userId: $userId, content: "Likes 90-minute focus sessions", type: "work_style", confidence: 0.85, importance: 0.5, status: "active", source: "demo", createdAt: datetime(), updatedAt: datetime()})

       CREATE (taskPresentation:Task {id: $taskPresentation, userId: $userId, content: "Client presentation due Wednesday", type: "presentation", confidence: 0.95, importance: 0.9, status: "active", source: "demo", createdAt: datetime(), updatedAt: datetime()})
       CREATE (taskProject:Task {id: $taskProject, userId: $userId, content: "Project deadline", type: "project", confidence: 0.9, importance: 0.8, status: "active", source: "demo", createdAt: datetime(), updatedAt: datetime()})
       CREATE (taskInternshipApp:Task {id: $taskInternshipApp, userId: $userId, content: "Internship application", type: "application", confidence: 0.9, importance: 0.7, status: "active", source: "demo", createdAt: datetime(), updatedAt: datetime()})

       CREATE (reason1:Reason {id: $reasonPresentation1, userId: $userId, content: "Important presentation requiring two days of preparation", confidence: 0.9, importance: 0.8, status: "active", source: "demo", createdAt: datetime(), updatedAt: datetime()})
       CREATE (reason2:Reason {id: $reasonPresentation2, userId: $userId, content: "Usually needs two days to prepare for important presentations", confidence: 0.9, importance: 0.8, status: "active", source: "demo", createdAt: datetime(), updatedAt: datetime()})

       CREATE (expLate:Experience {id: $expLateStress, userId: $userId, content: "Late preparation (one day before) caused stress", type: "negative", confidence: 0.9, importance: 0.7, status: "active", source: "demo", createdAt: datetime(), updatedAt: datetime()})
       CREATE (expEarly:Experience {id: $expEarlyGood, userId: $userId, content: "Early preparation produced a good presentation outcome", type: "positive", confidence: 0.85, importance: 0.7, status: "active", source: "demo", createdAt: datetime(), updatedAt: datetime()})

       CREATE (goalInternship:Goal {id: $goalInternship, userId: $userId, content: "Get an AI/backend internship", confidence: 0.9, importance: 0.9, status: "active", source: "demo", createdAt: datetime(), updatedAt: datetime()})
       CREATE (goalProductivity:Goal {id: $goalProductivity, userId: $userId, content: "Improve productivity", confidence: 0.8, importance: 0.6, status: "active", source: "demo", createdAt: datetime(), updatedAt: datetime()})
       CREATE (goalProjects:Goal {id: $goalProjects, userId: $userId, content: "Build strong projects", confidence: 0.8, importance: 0.7, status: "active", source: "demo", createdAt: datetime(), updatedAt: datetime()})

       CREATE (decisionPresentation:Decision {id: $decisionPresentation, userId: $userId, content: "Start presentation preparation Monday", confidence: 0.94, importance: 0.9, status: "active", source: "demo", createdAt: datetime(), updatedAt: datetime()})
       CREATE (decisionProject:Decision {id: $decisionProject, userId: $userId, content: "Work on project before gym", confidence: 0.8, importance: 0.6, status: "active", source: "demo", createdAt: datetime(), updatedAt: datetime()})
       CREATE (decisionInternship:Decision {id: $decisionInternship, userId: $userId, content: "Apply to AI startup internship", confidence: 0.85, importance: 0.8, status: "active", source: "demo", createdAt: datetime(), updatedAt: datetime()})

       CREATE (outcomeProjectDone:Outcome {id: $outcomeProjectDone, userId: $userId, content: "Project completed on time", type: "positive", confidence: 0.9, importance: 0.6, status: "active", source: "demo", createdAt: datetime(), updatedAt: datetime()})

       MERGE (u)-[:HAS_PREFERENCE]->(prefMorning)
       MERGE (u)-[:HAS_PREFERENCE]->(prefNoEarly)
       MERGE (u)-[:HAS_PREFERENCE]->(prefFocus)
       MERGE (u)-[:HAS_TASK]->(taskPresentation)
       MERGE (u)-[:HAS_TASK]->(taskProject)
       MERGE (u)-[:HAS_TASK]->(taskInternshipApp)
       MERGE (u)-[:HAS_GOAL]->(goalInternship)
       MERGE (u)-[:HAS_GOAL]->(goalProductivity)
       MERGE (u)-[:HAS_GOAL]->(goalProjects)
       MERGE (u)-[:HAD_EXPERIENCE]->(expLate)
       MERGE (u)-[:HAD_EXPERIENCE]->(expEarly)
       MERGE (u)-[:MADE_DECISION]->(decisionPresentation)
       MERGE (u)-[:MADE_DECISION]->(decisionProject)
       MERGE (u)-[:MADE_DECISION]->(decisionInternship)

       MERGE (decisionPresentation)-[:BASED_ON]->(reason1)
       MERGE (decisionPresentation)-[:BASED_ON]->(reason2)
       MERGE (decisionPresentation)-[:FOR_TASK]->(taskPresentation)
       MERGE (expLate)-[:INFLUENCED]->(decisionPresentation)
       MERGE (expEarly)-[:INFLUENCED]->(decisionPresentation)

       MERGE (decisionProject)-[:FOR_TASK]->(taskProject)
       MERGE (decisionProject)-[:LED_TO]->(outcomeProjectDone)
       MERGE (outcomeProjectDone)-[:INFLUENCES]->(decisionProject)

       MERGE (decisionInternship)-[:FOR_TASK]->(taskInternshipApp)
       MERGE (decisionInternship)-[:RELATED_TO]->(goalInternship)
       `,
      { userId, ...ids }
    );
  } finally {
    await session.close();
  }
}
