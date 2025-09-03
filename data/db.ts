import * as SQLite from "expo-sqlite";

export interface Category {
  id: string;
  name: string;
  description: string;
  subcategories: Subcategory[]; // Array of subcategory IDs
  cards: Card[]; // Array of card IDs
  createdAt: Date;
}

export interface Subcategory {
  id: string;
  name: string;
  description: string;
  categoryId: string; // ID of the parent category
  cards: Card[]; // Array of card IDs
  createdAt: Date;
}

export interface Card {
  id: string;
  categoryId: string; // ID of the parent category
  subcategoryId?: string; // ID of the parent sub
  title: string;
  definition: string;
  lastReviewed?: Date;
  numCorrect: number; // Number of times answered correctly
  numIncorrect: number; // Number of times answered incorrectly
  clue?: string; // Optional hint for the card
  createdAt: Date;
}

export interface ReviewSession {
  id: string;
  categoryId: string;
  subcategoryId?: string;
  reviewType: "standard" | "timed" | "100%" | "incorrect" | "custom";
  wrong: string[];
  right: string[];
  reviewedAt?: Date;
  createdAt: Date;
}

const db = SQLite.openDatabaseSync("flashcards.db");

// Setup the database
export const setupDatabase = () => {
  db.execSync(
    `
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS subcategories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            categoryId INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (categoryId) REFERENCES categories (id)
        );

        CREATE TABLE IF NOT EXISTS cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            definition TEXT NOT NULL,
            lastReviewed DATE,
            numCorrect INTEGER,
            numIncorrect INTEGER,
            clue TEXT,
            categoryId INTEGER,
            subcategoryId INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (categoryId) REFERENCES categories (id),
            FOREIGN KEY (subcategoryId) REFERENCES subcategories (id)
        );

        CREATE TABLE IF NOT EXISTS review_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            categoryId INTEGER,
            subcategoryId INTEGER,
            reviewType TEXT NOT NULL,
            wrong TEXT,
            right TEXT,
            reviewedAt DATE,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (categoryId) REFERENCES categories (id),
            FOREIGN KEY (subcategoryId) REFERENCES subcategories (id)
        );
        `
  );
};

// CATEGORIES
// Get all categories
export const getAllCategories = (): Category[] => {
  const categories = db.getAllSync(`SELECT * FROM categories;`);
  if (categories.length === 0) return [];

  return categories.map((cat: any): Category => {
    const subcategories = db.getAllSync<Subcategory>(
      `SELECT * FROM subcategories WHERE categoryId = ?`,
      [cat.id]
    );

    const cards = db.getAllSync<Card>(
      `SELECT * FROM cards WHERE categoryId = ?`,
      [cat.id]
    );

    return {
      id: cat.id.toString(),
      name: cat.name,
      description: cat.description,
      subcategories,
      cards,
      createdAt: new Date(cat.createdAt),
    };
  });
};

// Get Category by ID
export const getCategoryById = (id: string): Category | undefined => {
  const result = db.getFirstSync<Category>(
    `SELECT * FROM categories WHERE id = ?;`,
    [id]
  );
  if (result) {
    const subcategories = db.getAllSync<Subcategory>(
      `Select * FROM subcategories WHERE categoryID = ?`,
      [result.id]
    );
    const cards = db
      .getAllSync<Card>(`Select * FROM cards WHERE categoryID = ?`, [result.id])
      .map((c: any) => c.id.toString());
    return {
      id: result.id,
      name: result.name,
      description: result.description,
      subcategories,
      cards,
      createdAt: new Date(result.createdAt),
    };
  } else {
    return undefined;
  }
};

export const addCategory = (category: Omit<Category, "id" | "createdAt">) => {
  db.runSync(`INSERT INTO categories (name, description) VALUES (?, ?);`, [
    category.name,
    category.description,
  ]);
};

export const updateCategory = (id: string, category: Category) => {
  db.runSync(
    `UPDATE categories SET name = ?, description = ?, subcategories = ?, cards = ? WHERE id = ?;`,
    [category.name, category.description, id]
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
  if (result.length > 0) {
    return result.map((subcat: any): Subcategory => {
      const cards = db.getAllSync<Card>(
        `SELECT * FROM cards WHERE subcategoryId = ?`,
        [subcat.id]
      );
      return {
        id: subcat.id.toString(),
        name: subcat.name,
        description: subcat.description,
        categoryId: subcat.categoryId,
        cards,
        createdAt: new Date(subcat.createdAt),
      };
    });
  } else {
    return [];
  }
};

// Get a subcategory by ID
export const getSubcategoryById = (id: string): Subcategory | undefined => {
  const result = db.getFirstSync<Subcategory>(
    `SELECT * FROM subcategories WHERE id = ?;`,
    [id]
  );
  if (result) {
    const cards = db.getAllSync<Card>(
      `SELECT * FROM cards WHERE subcategoryId = ?`,
      [result.id]
    );
    return {
      id: result.id,
      name: result.name,
      description: result.description,
      categoryId: result.categoryId,
      cards,
      createdAt: new Date(result.createdAt),
    };
  }
  return undefined;
};

// Add a subcategory
export const addSubcategory = (
  subcategory: Omit<Subcategory, "id" | "createdAt">
) => {
  db.runSync(
    `INSERT INTO subcategories (name, description, categoryId, cards) VALUES (?, ?, ?, ?);`,
    [subcategory.name, subcategory.description, subcategory.categoryId]
  );
};

export const updateSubcategory = (id: string, subcategory: Subcategory) => {
  db.runSync(
    `UPDATE subcategories SET name = ?, description = ?, categoryId = ?, cards = ? WHERE id = ?;`,
    [subcategory.name, subcategory.description, subcategory.categoryId, id]
  );
};

// Delete a subcategory and remove from its parent category
export const deleteSubcategory = (id: string) => {
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
      lastReviewed: result.lastReviewed,
      numCorrect: result.numCorrect,
      numIncorrect: result.numIncorrect,
      clue: result.clue,
      createdAt: new Date(result.createdAt),
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
      lastReviewed: result.lastReviewed,
      numCorrect: result.numCorrect,
      numIncorrect: result.numIncorrect,
      clue: result.clue,
      createdAt: new Date(result.createdAt),
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
      lastReviewed: result.lastReviewed,
      numCorrect: result.numCorrect,
      numIncorrect: result.numIncorrect,
      clue: result.clue,
      createdAt: new Date(result.createdAt),
    })
  );
};

export const getCardBySession = (sessionId: string): Card[] => {
  const result = db.getAllSync<Card>(
    `SELECT * FROM cards WHERE sessionId = ?;`,
    [sessionId]
  );
  if (result.length === 0) return [];
  return result.map(
    (result: any): Card => ({
      id: result.id,
      categoryId: result.categoryId,
      subcategoryId: result.subcategoryId,
      title: result.title,
      definition: result.definition,
      lastReviewed: result.lastReviewed,
      numCorrect: result.numCorrect,
      numIncorrect: result.numIncorrect,
      clue: result.clue,
      createdAt: new Date(result.createdAt),
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
      lastReviewed: result.lastReviewed
        ? new Date(result.lastReviewed)
        : undefined,
      numCorrect: result.numCorrect ?? 0,
      numIncorrect: result.numIncorrect ?? 0,
      clue: result.clue ?? undefined,
      createdAt: new Date(result.createdAt),
    };
  }
};

// Add a card
export const addCard = (card: Omit<Card, "id" | "createdAt">) => {
  db.runSync(
    `INSERT INTO cards (categoryId, subcategoryId, title, definition, lastReviewed, numCorrect, numIncorrect) VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      card.categoryId ?? null,
      card.subcategoryId ?? null,
      card.title,
      card.definition,
      card.lastReviewed ? card.lastReviewed.toISOString() : null,
      card.numCorrect ?? 0,
      card.numIncorrect ?? 0,
      card.clue ?? null,
    ]
  );
};

// Update a card
export const updateCard = (id: string, card: Card) => {
  db.runSync(
    `UPDATE cards SET categoryId = ?, subcategoryId = ?, title = ?, definition = ?, lastReviewed = ?, numCorrect = ?, numIncorrect = ? WHERE id = ?;`,
    [
      card.categoryId ?? null,
      card.subcategoryId ?? null,
      card.title,
      card.definition,
      card.lastReviewed ? card.lastReviewed.toISOString() : null,
      card.numCorrect ?? 0,
      card.numIncorrect ?? 0,
      card.clue ?? null,
      id,
    ]
  );
};

// Delete a card, remove it from it's parent categories and subcategories if present
export const deleteCard = (id: string) => {
  db.runSync(`DELETE FROM cards WHERE id = ?;`, [id]);
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
      reviewType: result.reviewType,
      wrong: JSON.parse(result.wrong ?? "[]"),
      right: JSON.parse(result.right ?? "[]"),
      reviewedAt: result.reviewedAt ? new Date(result.reviewedAt) : new Date(),
      createdAt: result.createdAt ? new Date(result.createdAt) : new Date(),
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
    reviewType: latest.reviewType,
    wrong:
      typeof latest.wrong === "string"
        ? JSON.parse(latest.wrong)
        : latest.wrong || [],
    right:
      typeof latest.right === "string"
        ? JSON.parse(latest.right)
        : latest.right || [],
    reviewedAt: latest.reviewedAt ? new Date(latest.reviewedAt) : new Date(),
    createdAt: latest.createdAt ? new Date(latest.createdAt) : new Date(),
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
    reviewType: session.reviewType,
    wrong:
      typeof session.wrong === "string"
        ? JSON.parse(session.wrong)
        : session.wrong || [],
    right:
      typeof session.right === "string"
        ? JSON.parse(session.right)
        : session.right || [],
    reviewedAt: session.reviewedAt ? new Date(session.reviewedAt) : new Date(),
    createdAt: session.createdAt ? new Date(session.createdAt) : new Date(),
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
    reviewType: session.reviewType,
    wrong:
      typeof session.wrong === "string"
        ? JSON.parse(session.wrong)
        : session.wrong || [],
    right:
      typeof session.right === "string"
        ? JSON.parse(session.right)
        : session.right || [],
    reviewedAt: session.reviewedAt ? new Date(session.reviewedAt) : new Date(),
    createdAt: session.createdAt ? new Date(session.createdAt) : new Date(),
  }));
};

export const getReviewSessionById = (id: string): ReviewSession | null => {
  const result = db.getFirstSync<ReviewSession>(
    `SELECT * FROM review_sessions WHERE id = ?;`,
    [id]
  );
  if (!result) return null;
  const session = result;
  return {
    id: session.id,
    categoryId: session.categoryId ?? undefined,
    subcategoryId: session.subcategoryId ?? undefined,
    reviewType: session.reviewType,
    wrong:
      typeof session.wrong === "string"
        ? JSON.parse(session.wrong)
        : session.wrong || [],
    right:
      typeof session.right === "string"
        ? JSON.parse(session.right)
        : session.right || [],
    reviewedAt: session.reviewedAt ? new Date(session.reviewedAt) : new Date(),
    createdAt: session.createdAt ? new Date(session.createdAt) : new Date(),
  };
};

// Add a review session
export const addReviewSession = (
  session: Omit<ReviewSession, "id" | "createdAt">
) => {
  db.runSync(
    `INSERT INTO review_sessions (categoryId, subcategoryId, reviewType, wrong, right, reviewedAt) VALUES (?, ?, ?, ?, ?, ?);`,
    [
      session.categoryId ?? null,
      session.subcategoryId ?? null,
      session.reviewType,
      session.wrong ? JSON.stringify(session.wrong) : null,
      session.right ? JSON.stringify(session.right) : null,
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
