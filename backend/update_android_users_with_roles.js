/**
 * Update User Android Table with Role Management
 * PT. Topline Evergreen Manufacturing
 * Add bcrypt password hashing and proper user roles
 */

const bcrypt = require('bcryptjs');
const { execute } = require('./config/databaseAdapter');

async function updateAndroidUsers() {
    console.log('🔄 Updating Android Users with Role Management...');
    
    try {
        // Clear existing users
        console.log('🗑️ Clearing existing users...');
        await execute('DELETE FROM userandroid');
        
        // Reset auto increment
        await execute('ALTER TABLE userandroid AUTO_INCREMENT = 1');
        
        // Hash passwords
        const hashedAdmin123 = await bcrypt.hash('admin123', 10);
        console.log('🔐 Passwords hashed successfully');
        
        // Insert updated users with proper roles
        const users = [
            {
                username: 'production01',
                password: hashedAdmin123,
                role: 'supervisor'
            },
            {
                username: 'qc01',
                password: hashedAdmin123,
                role: 'supervisor'
            },
            {
                username: 'wh01',
                password: hashedAdmin123,
                role: 'supervisor'
            },
            {
                username: 'admin',
                password: hashedAdmin123,
                role: 'admin'
            },
            {
                username: 'operator01',
                password: hashedAdmin123,
                role: 'operator'
            },
            {
                username: 'operator02',
                password: hashedAdmin123,
                role: 'operator'
            },
            {
                username: 'qc_inspector01',
                password: hashedAdmin123,
                role: 'operator'
            },
            {
                username: 'wh_operator01',
                password: hashedAdmin123,
                role: 'operator'
            }
        ];
        
        console.log('👥 Inserting users...');
        
        for (const user of users) {
            await execute(`
                INSERT INTO userandroid 
                (username, password, role)
                VALUES (?, ?, ?)
            `, [
                user.username,
                user.password,
                user.role
            ]);
            
            console.log(`   ✅ Added: ${user.username} (${user.role})`);
        }
        
        // Verify inserted users
        const [insertedUsers] = await execute(`
            SELECT username, role 
            FROM userandroid 
            ORDER BY id
        `);
        
        console.log('\n📋 Updated User List:');
        console.log('========================================');
        insertedUsers.forEach(user => {
            console.log(`${user.username.padEnd(20)} | ${user.role.padEnd(10)}`);
        });
        
        console.log('\n✅ Android Users updated successfully!');
        console.log('\n🔑 All users use password: admin123');
        console.log('\n🚀 Ready for role-based authentication!');
        console.log('\n📱 Test credentials:');
        console.log('   Supervisor Production: production01 / admin123');
        console.log('   Supervisor QC: qc01 / admin123');
        console.log('   Supervisor Warehouse: wh01 / admin123');
        console.log('   Administrator: admin / admin123');
        
    } catch (error) {
        console.error('❌ Error updating users:', error);
        throw error;
    }
}

// Run the update
updateAndroidUsers()
    .then(() => {
        console.log('\n🎯 Role-based authentication system ready!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Failed to update users:', error.message);
        process.exit(1);
    });
