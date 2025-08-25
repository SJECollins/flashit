import * as SQLite from "expo-sqlite";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

export interface Category {
  id: string;
  name: string;
  description: string;
  subcategories?: string[]; // Array of subcategory IDs
  cards?: string[]; // Array of card IDs
}

export interface Subcategory {
  id: string;
  name: string;
  description: string;
  categoryId: string; // ID of the parent category
  cards?: string[]; // Array of card IDs
}

export interface Card {
  id: string;
  categoryId?: string; // ID of the parent category
  subcategoryId?: string; // ID of the parent sub
  title: string;
  definition: string;
  last_reviewed?: Date;
  num_correct: number; // Number of times answered correctly
  num_incorrect: number; // Number of times answered incorrectly
  clue?: string; // Optional hint for the card
}

export interface ReviewSession {
  id: string;
  categoryId?: string;
  subcategoryId?: string;
  review_type: "standard" | "timed" | "100%" | "incorrect" | "custom";
  wrong: boolean;
  right: boolean;
  reviewedAt?: Date;
}

const db = SQLite.openDatabaseSync("flashcards.db");

// Setup the database
export const setupDatabase = () => {
  db.execSync(
    `
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT
        );

        CREATE TABLE IF NOT EXISTS subcategories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            categoryId INTEGER,
            FOREIGN KEY (categoryId) REFERENCES categories (id)
        );

        CREATE TABLE IF NOT EXISTS cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            definition TEXT NOT NULL,
            last_reviewed DATE,
            num_correct INTEGER,
            num_incorrect INTEGER,
            clue TEXT,
            categoryId INTEGER,
            subcategoryId INTEGER,
            FOREIGN KEY (categoryId) REFERENCES categories (id),
            FOREIGN KEY (subcategoryId) REFERENCES subcategories (id)
        );

        CREATE TABLE IF NOT EXISTS review_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            categoryId INTEGER,
            subcategoryId INTEGER,
            review_type TEXT NOT NULL,
            wrong BOOLEAN,
            right BOOLEAN,
            reviewedAt DATE,
            FOREIGN KEY (categoryId) REFERENCES categories (id),
            FOREIGN KEY (subcategoryId) REFERENCES subcategories (id),
            FOREIGN KEY (cardId) REFERENCES cards (id)
        );
        `
  );
};

// CATEGORIES
// Get all categories
export const getAllCategories = (): Category[] => {
  const result = db.getAllSync(`SELECT * FROM categories;`);
  if (result.length === 0) return [];
  return result.map(
    (result: any): Category => ({
      id: result.id,
      name: result.name,
      description: result.description,
      subcategories: result.subcategories
        ? JSON.parse(result.subcategories)
        : [],
      cards: result.cards ? JSON.parse(result.cards) : [],
    })
  );
};

// Get Category by ID
export const getCategoryById = (id: string): Category | undefined => {
  const result = db.getFirstSync<Category>(
    `SELECT * FROM categories WHERE id = ?;`,
    [id]
  );
  if (result) {
    return {
      id: result.id,
      name: result.name,
      description: result.description,
      subcategories: JSON.parse(
        typeof result.subcategories === "string" ? result.subcategories : "[]"
      ),
      cards: JSON.parse(typeof result.cards === "string" ? result.cards : "[]"),
    };
  }
  return undefined;
};

export const addCategory = (category: Omit<Category, "id">) => {
  db.runSync(
    `INSERT INTO categories (name, description, subcategories, cards) VALUES (?, ?, ?, ?);`,
    [
      category.name,
      category.description,
      JSON.stringify(category.subcategories || []),
      JSON.stringify(category.cards || []),
    ]
  );
};

export const updateCategory = (id: string, category: Category) => {
  db.runSync(
    `UPDATE categories SET name = ?, description = ?, subcategories = ?, cards = ? WHERE id = ?;`,
    [
      category.name,
      category.description,
      JSON.stringify(category.subcategories || []),
      JSON.stringify(category.cards || []),
      id,
    ]
  );
};

export const deleteCategory = (id: string) => {
  db.runSync(`DELETE FROM categories WHERE id = ?;`, [id]);
};

// SUBCATEGORIES
// Get the subcategories for a specific category
export const getSubcategories = (categoryId: string): Subcategory[] => {
  const result = db.getAllSync(
    `SELECT * FROM subcategories WHERE categoryId = ?;`,
    [categoryId]
  );
  if (result.length === 0) return [];
  return result.map(
    (result: any): Subcategory => ({
      id: result.id,
      name: result.name,
      description: result.description,
      categoryId: result.categoryId,
      cards: result.cards ? JSON.parse(result.cards) : [],
    })
  );
};

// Get a subcategory by ID
export const getSubcategoryById = (id: string): Subcategory | undefined => {
  const result = db.getFirstSync<Subcategory>(
    `SELECT * FROM subcategories WHERE id = ?;`,
    [id]
  );
  if (result) {
    return {
      id: result.id,
      name: result.name,
      description: result.description,
      categoryId: result.categoryId,
      cards: JSON.parse(typeof result.cards === "string" ? result.cards : "[]"),
    };
  }
  return undefined;
};

// Add a subcategory
export const addSubcategory = (subcategory: Omit<Subcategory, "id">) => {
  db.runSync(
    `INSERT INTO subcategories (name, description, categoryId, cards) VALUES (?, ?, ?, ?);`,
    [
      subcategory.name,
      subcategory.description,
      subcategory.categoryId,
      JSON.stringify(subcategory.cards || []),
    ]
  );
};

export const updateSubcategory = (id: string, subcategory: Subcategory) => {
  db.runSync(
    `UPDATE subcategories SET name = ?, description = ?, categoryId = ?, cards = ? WHERE id = ?;`,
    [
      subcategory.name,
      subcategory.description,
      subcategory.categoryId,
      JSON.stringify(subcategory.cards || []),
      id,
    ]
  );
};

// Delete a subcategory and remove from its parent category
export const deleteSubcategory = (id: string) => {
  const subcat = getSubcategoryById(id);
  if (subcat && subcat.categoryId) {
    const category = getCategoryById(subcat.categoryId);
    if (category) {
      category.subcategories = category.subcategories?.filter(
        (subId) => subId !== id
      );
      updateCategory(category.id, category);
    }
  }
  db.runSync(`DELETE FROM subcategories WHERE id = ?;`, [id]);
};

// CARDS
// Get all cards
export const getAllCards = (): Card[] => {
  const result = db.getAllSync(`SELECT * FROM cards;`);
  if (result.length === 0) return [];
  return result.map(
    (result: any): Card => ({
      id: result.id,
      categoryId: result.categoryId,
      subcategoryId: result.subcategoryId,
      title: result.title,
      definition: result.definition,
      last_reviewed: result.last_reviewed,
      num_correct: result.num_correct,
      num_incorrect: result.num_incorrect,
      clue: result.clue,
    })
  );
};

// Get cards by category
export const getCardsByCategory = (categoryId: string): Card[] => {
  const result = db.getAllSync(`SELECT * FROM cards WHERE categoryId = ?;`, [
    categoryId,
  ]);
  if (result.length === 0) return [];
  return result.map(
    (result: any): Card => ({
      id: result.id,
      categoryId: result.categoryId,
      subcategoryId: result.subcategoryId,
      title: result.title,
      definition: result.definition,
      last_reviewed: result.last_reviewed,
      num_correct: result.num_correct,
      num_incorrect: result.num_incorrect,
      clue: result.clue,
    })
  );
};

// Get cards by subcategory
export const getCardsBySubcategory = (subcategoryId: string): Card[] => {
  const result = db.getAllSync(`SELECT * FROM cards WHERE subcategoryId = ?;`, [
    subcategoryId,
  ]);
  if (result.length === 0) return [];
  return result.map(
    (result: any): Card => ({
      id: result.id,
      categoryId: result.categoryId,
      subcategoryId: result.subcategoryId,
      title: result.title,
      definition: result.definition,
      last_reviewed: result.last_reviewed,
      num_correct: result.num_correct,
      num_incorrect: result.num_incorrect,
      clue: result.clue,
    })
  );
};

// Get a card by ID
export const getCardById = (id: string): Card | undefined => {
  const result = db.getFirstSync<Card>(`SELECT * FROM cards WHERE id = ?;`, [
    id,
  ]);
  if (result) {
    return {
      id: result.id,
      categoryId: result.categoryId ?? undefined,
      subcategoryId: result.subcategoryId ?? undefined,
      title: result.title,
      definition: result.definition,
      last_reviewed: result.last_reviewed
        ? new Date(result.last_reviewed)
        : undefined,
      num_correct: result.num_correct ?? 0,
      num_incorrect: result.num_incorrect ?? 0,
      clue: result.clue ?? undefined,
    };
  }
};

// Add a card
export const addCard = (card: Omit<Card, "id">) => {
  db.runSync(
    `INSERT INTO cards (categoryId, subcategoryId, title, definition, last_reviewed, num_correct, num_incorrect) VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      card.categoryId ?? null,
      card.subcategoryId ?? null,
      card.title,
      card.definition,
      card.last_reviewed ? card.last_reviewed.toISOString() : null,
      card.num_correct ?? 0,
      card.num_incorrect ?? 0,
      card.clue ?? null,
    ]
  );
};

// Update a card
export const updateCard = (id: string, card: Card) => {
  db.runSync(
    `UPDATE cards SET categoryId = ?, subcategoryId = ?, title = ?, definition = ?, last_reviewed = ?, num_correct = ?, num_incorrect = ? WHERE id = ?;`,
    [
      card.categoryId ?? null,
      card.subcategoryId ?? null,
      card.title,
      card.definition,
      card.last_reviewed ? card.last_reviewed.toISOString() : null,
      card.num_correct ?? 0,
      card.num_incorrect ?? 0,
      card.clue ?? null,
      id,
    ]
  );
};

// Delete a card, remove it from it's parent categories and subcategories if present
export const deleteCard = (id: string) => {
  const card = getCardById(id);
  if (card) {
    if (card.categoryId) {
      const category = getCategoryById(card.categoryId);
      if (category) {
        category.cards = category.cards?.filter((cardId) => cardId !== id);
        updateCategory(category.id, category);
      }
    }
    if (card.subcategoryId) {
      const subcategory = getSubcategoryById(card.subcategoryId);
      if (subcategory) {
        subcategory.cards = subcategory.cards?.filter(
          (cardId) => cardId !== id
        );
        updateSubcategory(subcategory.id, subcategory);
      }
    }
    db.runSync(`DELETE FROM cards WHERE id = ?;`, [id]);
  }
};

// REVIEW SESSIONS
// Get all review sessions
export const getAllReviewSessions = (): ReviewSession[] => {
  const result = db.getAllSync(`SELECT * FROM review_sessions;`);
  if (result.length === 0) return [];
  return result.map(
    (result: any): ReviewSession => ({
      id: result.id,
      categoryId: result.categoryId ?? null,
      subcategoryId: result.subcategoryId ?? null,
      review_type: result.review_type,
      wrong: result.wrong ?? null,
      right: result.right ?? null,
      reviewedAt: result.reviewedAt ? new Date(result.reviewedAt) : new Date(),
    })
  );
};

// Get latest review session
export const getLatestReviewSession = (): ReviewSession | null => {
  const result = db.getAllSync<ReviewSession>(
    `SELECT * FROM review_sessions ORDER BY reviewedAt DESC LIMIT 1;`
  );
  if (result.length === 0) return null;
  const latest = result[0];
  return {
    id: latest.id,
    categoryId: latest.categoryId ?? undefined,
    subcategoryId: latest.subcategoryId ?? undefined,
    review_type: latest.review_type,
    wrong: latest.wrong ?? null,
    right: latest.right ?? null,
    reviewedAt: latest.reviewedAt ? new Date(latest.reviewedAt) : new Date(),
  };
};

// Get review sessions by category
export const getReviewSessionsByCategory = (
  categoryId: string
): ReviewSession[] => {
  const result = db.getAllSync<ReviewSession>(
    `SELECT * FROM review_sessions WHERE categoryId = ? ORDER BY reviewedAt DESC;`,
    [categoryId]
  );
  if (result.length === 0) return [];
  return result.map((session) => ({
    id: session.id,
    categoryId: session.categoryId ?? undefined,
    subcategoryId: session.subcategoryId ?? undefined,
    review_type: session.review_type,
    wrong: session.wrong ?? null,
    right: session.right ?? null,
    reviewedAt: session.reviewedAt ? new Date(session.reviewedAt) : new Date(),
  }));
};

// Get review sessions by subcategory
export const getReviewSessionsBySubcategory = (
  subcategoryId: string
): ReviewSession[] => {
  const result = db.getAllSync<ReviewSession>(
    `SELECT * FROM review_sessions WHERE subcategoryId = ? ORDER BY reviewedAt DESC;`,
    [subcategoryId]
  );
  if (result.length === 0) return [];
  return result.map((session) => ({
    id: session.id,
    categoryId: session.categoryId ?? undefined,
    subcategoryId: session.subcategoryId ?? undefined,
    review_type: session.review_type,
    wrong: session.wrong ?? null,
    right: session.right ?? null,
    reviewedAt: session.reviewedAt ? new Date(session.reviewedAt) : new Date(),
  }));
};

// Add a review session
export const addReviewSession = (session: ReviewSession) => {
  db.runSync(
    `INSERT INTO review_sessions (categoryId, subcategoryId, review_type, wrong, right, reviewedAt) VALUES (?, ?, ?, ?, ?, ?);`,
    [
      session.categoryId ?? null,
      session.subcategoryId ?? null,
      session.review_type,
      session.wrong ?? null,
      session.right ?? null,
      session.reviewedAt ? session.reviewedAt.toISOString() : null,
    ]
  );
};

// Delete a review session
export const deleteReviewSession = (id: string) => {
  db.runSync(`DELETE FROM review_sessions WHERE id = ?;`, [id]);
};

// Reset the database
export const resetDatabase = () => {
  db.execSync(
    `
        DROP TABLE IF EXISTS cards;
        DROP TABLE IF EXISTS subcategories;
        DROP TABLE IF EXISTS categories;
        DROP TABLE IF EXISTS review_sessions;
        `
  );
  setupDatabase();
};
