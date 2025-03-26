// LOL why is everything red?????? I think vscode is not recognizing the jest extension
//

import { Pool, PoolClient } from 'pg'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

let pool: Pool
let client: PoolClient
const serviceClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

const TEST_COURSE_PREFIX = 'Test Course'

beforeAll(async () => {
  pool = new Pool({ connectionString: process.env.DATABASE_URL })
  client = await pool.connect()
})

afterAll(async () => {
  await client.release()
  await pool.end()
})

beforeEach(async () => {
  await cleanupTestData()
})

/**
 * Helper function to clean up test data
 */
async function cleanupTestData() {
  await client.query(`DELETE FROM courses_likes WHERE course_id IN (SELECT id FROM courses WHERE title LIKE $1)`, [
    `${TEST_COURSE_PREFIX}%`
  ])
  await client.query(`DELETE FROM courses WHERE title LIKE $1`, [`${TEST_COURSE_PREFIX}%`])
}

/**
 * I can create seed data but I think it would be better to create here
 * test courses and likes for two different users
 */
async function setupTestData() {
  // Not sure about the side effect of this, maybe will take a look later
  // I'm getting errors with updated_at and I think its because of the
  // existing triggers? I'll disable it for now
  await client.query('SET session_replication_role = replica')

  try {
    // Create user IDs???? I think I can use the login function like in index.ts
    const user1Id = uuidv4()
    const user2Id = uuidv4()

    // Create test courses
    const coursesData = [
      { title: `${TEST_COURSE_PREFIX} 1`, description: 'Description 1' },
      { title: `${TEST_COURSE_PREFIX} 2`, description: 'Description 2' },
      { title: `${TEST_COURSE_PREFIX} 3`, description: 'Description 3' },
      { title: `${TEST_COURSE_PREFIX} 4`, description: 'Description 4' }
    ]

    // Maybe there is a better way???? but lets insert courses directly with SQL
    const coursesResult = await client.query(
      `
      INSERT INTO courses (title, description)
      VALUES 
        ($1, $2), ($3, $4), ($5, $6), ($7, $8)
      RETURNING id
      `,
      coursesData.flatMap((course) => [course.title, course.description])
    )

    const courseIds = coursesResult.rows.map((row) => row.id)

    // Insert test data using SQL to bypass RLS LOL
    await client.query(
      `
      INSERT INTO courses_likes (user_id, course_id)
      VALUES 
        ($1, $2), ($3, $4), ($5, $6), ($7, $8)
      `,
      [user1Id, courseIds[0], user1Id, courseIds[1], user2Id, courseIds[2], user2Id, courseIds[3]]
    )

    return { user1: user1Id, user2: user2Id, courseIds }
  } finally {
    // Always re-enable triggers
    await client.query('SET session_replication_role = DEFAULT')
  }
}

/**
 * Refer to README FAQ
 * Execute SQL in transaction with specific user role and ID
 */
async function executeAsUser(userId: string, sqlCallback: () => Promise<void>) {
  try {
    await client.query('BEGIN')
    await client.query('SET ROLE authenticated')
    await client.query(`SET LOCAL "request.jwt.claims" TO '{ "sub": "${userId}" }'`)

    await sqlCallback()

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    // Reset role to default
    await client.query('BEGIN')
    await client.query('SET ROLE postgres')
    await client.query('COMMIT')
  }
}

/**
 * Refer to README FAQ
 * Might be an overkill but I think this is the best way to test the RLS policies
 * Execute SQL in transaction with admin role
 */
async function executeAsAdmin(sqlCallback: () => Promise<void>) {
  try {
    await client.query('BEGIN')
    await client.query('SET ROLE postgres') // Admin role

    await sqlCallback()

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  }
}

describe('courses_likes RLS policies', () => {
  it('should allow users to view only their own liked courses', async () => {
    // Setup test data
    const { user1, user2 } = await setupTestData()

    await executeAsUser(user1, async () => {
      // Verify auth.uid() is returning the correct user
      const uidCheck = await client.query('SELECT auth.uid() as uid')
      expect(uidCheck.rows[0].uid).toBe(user1)

      // User should only see their own likes
      const userLikesQuery = await client.query(`SELECT * FROM courses_likes`)
      const visibleLikes = userLikesQuery.rows

      // Should see only their own likes
      expect(visibleLikes.length).toBeGreaterThanOrEqual(2)
      visibleLikes.forEach((like) => {
        expect(like.user_id).toBe(user1)
      })

      // Filter for the other user's likes should return empty
      const user2LikesQuery = await client.query(`SELECT * FROM courses_likes WHERE user_id = $1`, [user2])
      const user2Likes = user2LikesQuery.rows
      expect(user2Likes.length).toBe(0)
    })
  })

  // Lets test the superadmin role, not included in the requirements but just curious
  it('should allow superadmins to view all liked courses', async () => {
    // Setup test data
    const { user1, user2 } = await setupTestData()

    await executeAsAdmin(async () => {
      // Query all likes
      const allLikesQuery = await client.query('SELECT * FROM courses_likes')
      const allLikes = allLikesQuery.rows

      expect(allLikes.length).toBeGreaterThanOrEqual(4)

      // Verify we can see both user1 and user2's likes
      const user1Likes = allLikes.filter((like) => like.user_id === user1)
      const user2Likes = allLikes.filter((like) => like.user_id === user2)

      expect(user1Likes.length).toBeGreaterThanOrEqual(2)
      expect(user2Likes.length).toBeGreaterThanOrEqual(2)
    })
  })
})
