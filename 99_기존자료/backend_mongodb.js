    // =============================================
    // Five Guys - Relationship File Manager
    // Backend Code: MongoDB Connection & CRUD
    // =============================================

    const { MongoClient } = require('mongodb');

    // MongoDB connection config
    const uri = 'mongodb://localhost:27017';  // or MongoDB Atlas URI
    const dbName = 'relationship_file_manager';

    async function main() {
        const client = new MongoClient(uri);

        try {
            // 1. Connect to MongoDB
            await client.connect();
            console.log('Connected to MongoDB successfully!\n');

            const db = client.db(dbName);

            // Collections
            const users = db.collection('users');
            const documents = db.collection('documents');
            const nodes = db.collection('nodes');

            // =============================================
            // INSERT - 데이터 삽입
            // =============================================

            // Insert users
            const userResult = await users.insertMany([
                {
                    username: 'ocean1229',
                    email: 'kangdh@example.com',
                    display_name: 'Kang Doohyen',
                    created_at: new Date()
                },
                {
                    username: 'victor_kim',
                    email: 'yushin@example.com',
                    display_name: 'Kim Yushin',
                    created_at: new Date()
                },
                {
                    username: 'guingguing',
                    email: 'jinseo@example.com',
                    display_name: 'Kim Jinseo',
                    created_at: new Date()
                }
            ]);
            const userIds = userResult.insertedIds;
            console.log(`INSERT ${userResult.insertedCount} users`);

            // Insert documents (with embedded nodes, relationships, attributes)
            const docResult = await documents.insertMany([
                {
                    user_id: userIds[0],
                    title: 'Software Architecture',
                    content: '# Software Architecture\n\n@DesignPattern relates to @SOLID\n$type: technical',
                    is_public: true,
                    nodes: [
                        {
                            label: 'DesignPattern',
                            node_type: 'concept',
                            position: { x: 0.0, y: 1.0, z: 0.5 },
                            attributes: { type: 'technical', priority: 'high' }
                        },
                        {
                            label: 'SOLID',
                            node_type: 'concept',
                            position: { x: 2.0, y: 1.0, z: 0.0 },
                            attributes: { type: 'technical', principles: 'SRP, OCP, LSP, ISP, DIP' }
                        },
                        {
                            label: 'Software Architecture',
                            node_type: 'topic',
                            position: { x: 1.0, y: 3.0, z: 1.0 },
                            attributes: {}
                        }
                    ],
                    relationships: [
                        { source: 'DesignPattern', target: 'SOLID', type: 'relates_to', description: 'Design patterns implement SOLID principles' },
                        { source: 'Software Architecture', target: 'DesignPattern', type: 'contains', description: 'Architecture includes design patterns' },
                        { source: 'Software Architecture', target: 'SOLID', type: 'contains', description: 'Architecture follows SOLID' }
                    ],
                    created_at: new Date(),
                    updated_at: new Date()
                },
                {
                    user_id: userIds[0],
                    title: 'Team Meeting Notes',
                    content: '# Meeting 2026-04-01\n\n@KangDH assigned to @Frontend',
                    is_public: false,
                    nodes: [
                        {
                            label: 'KangDH',
                            node_type: 'person',
                            position: { x: 0.0, y: 0.0, z: 0.0 },
                            attributes: { role: 'Project Leader', status: 'in-progress' }
                        },
                        {
                            label: 'Frontend',
                            node_type: 'task',
                            position: { x: 3.0, y: 0.0, z: 1.0 },
                            attributes: {}
                        }
                    ],
                    relationships: [
                        { source: 'KangDH', target: 'Frontend', type: 'assigned_to', description: 'KangDH works on Frontend' }
                    ],
                    created_at: new Date(),
                    updated_at: new Date()
                },
                {
                    user_id: userIds[1],
                    title: 'Database Design',
                    content: '# DB Design\n\n@MySQL connects to @NodeJS',
                    is_public: true,
                    nodes: [
                        {
                            label: 'MySQL',
                            node_type: 'technology',
                            position: { x: 1.0, y: 2.0, z: 0.0 },
                            attributes: { version: '8.0' }
                        },
                        {
                            label: 'NodeJS',
                            node_type: 'technology',
                            position: { x: 4.0, y: 2.0, z: 0.0 },
                            attributes: { runtime: 'V8 Engine' }
                        }
                    ],
                    relationships: [
                        { source: 'MySQL', target: 'NodeJS', type: 'connects_to', description: 'MySQL connects to NodeJS via driver' }
                    ],
                    created_at: new Date(),
                    updated_at: new Date()
                }
            ]);
            console.log(`INSERT ${docResult.insertedCount} documents\n`);

            // Separate nodes collection (for 3D graph queries)
            const nodeResult = await nodes.insertMany([
                { user_id: userIds[0], doc_id: docResult.insertedIds[0], label: 'DesignPattern', node_type: 'concept', position: { x: 0, y: 1, z: 0.5 } },
                { user_id: userIds[0], doc_id: docResult.insertedIds[0], label: 'SOLID', node_type: 'concept', position: { x: 2, y: 1, z: 0 } },
                { user_id: userIds[0], doc_id: docResult.insertedIds[1], label: 'KangDH', node_type: 'person', position: { x: 0, y: 0, z: 0 } },
                { user_id: userIds[1], doc_id: docResult.insertedIds[2], label: 'MySQL', node_type: 'technology', position: { x: 1, y: 2, z: 0 } },
            ]);
            console.log(`INSERT ${nodeResult.insertedCount} nodes to graph collection\n`);

            // =============================================
            // SELECT (FIND) - 데이터 조회
            // =============================================

            // Find all users
            const allUsers = await users.find({}).toArray();
            console.log('FIND all users:', allUsers.map(u => u.display_name));

            // Find user's documents
            const userDocs = await documents.find({ user_id: userIds[0] }).toArray();
            console.log('\nFIND user documents:', userDocs.map(d => d.title));

            // Find public documents with node count
            const publicDocs = await documents.find({ is_public: true }).toArray();
            console.log('\nFIND public documents:');
            publicDocs.forEach(d => {
                console.log(`  - ${d.title}: ${d.nodes.length} nodes, ${d.relationships.length} relationships`);
            });

            // Find nodes by type using $elemMatch
            const techDocs = await documents.find({
                nodes: { $elemMatch: { node_type: 'technology' } }
            }).toArray();
            console.log('\nFIND documents with technology nodes:', techDocs.map(d => d.title));

            // Aggregation: documents per user
            const docsPerUser = await documents.aggregate([
                {
                    $group: {
                        _id: '$user_id',
                        doc_count: { $sum: 1 },
                        total_nodes: { $sum: { $size: '$nodes' } }
                    }
                }
            ]).toArray();
            console.log('\nAGGREGATE docs per user:', docsPerUser);

            // Find specific relationship type
            const containsDocs = await documents.find({
                'relationships.type': 'contains'
            }).toArray();
            console.log('\nFIND documents with "contains" relationships:', containsDocs.map(d => d.title));

            // Find node attributes
            const doc = await documents.findOne({ title: 'Software Architecture' });
            console.log('\nFIND DesignPattern attributes:', doc.nodes[0].attributes);

            // =============================================
            // UPDATE - 데이터 수정
            // =============================================

            // Update document title
            await documents.updateOne(
                { _id: docResult.insertedIds[0] },
                { $set: { title: 'Software Architecture Patterns', updated_at: new Date() } }
            );
            console.log('\nUPDATE document title');

            // Update node position (embedded)
            await documents.updateOne(
                { _id: docResult.insertedIds[0], 'nodes.label': 'DesignPattern' },
                { $set: { 'nodes.$.position': { x: 2.5, y: 3.0, z: 1.5 } } }
            );
            console.log('UPDATE node position');

            // Update node attribute
            await documents.updateOne(
                { _id: docResult.insertedIds[0], 'nodes.label': 'DesignPattern' },
                { $set: { 'nodes.$.attributes.priority': 'critical' } }
            );
            console.log('UPDATE attribute priority -> critical');

            // Add new attribute to node
            await documents.updateOne(
                { _id: docResult.insertedIds[0], 'nodes.label': 'SOLID' },
                { $set: { 'nodes.$.attributes.importance': 'fundamental' } }
            );
            console.log('UPDATE add new attribute to SOLID');

            // Update user display name
            await users.updateOne(
                { username: 'ocean1229' },
                { $set: { display_name: 'DH Kang' } }
            );
            console.log('UPDATE user display name');

            // Verify update
            const updatedDoc = await documents.findOne({ _id: docResult.insertedIds[0] });
            console.log('Verified updated title:', updatedDoc.title);
            console.log('Verified updated position:', updatedDoc.nodes[0].position);

            // =============================================
            // DELETE (REMOVE) - 데이터 삭제
            // =============================================

            // Delete an attribute from node (using $unset)
            await documents.updateOne(
                { _id: docResult.insertedIds[1], 'nodes.label': 'KangDH' },
                { $unset: { 'nodes.$.attributes.status': '' } }
            );
            console.log('\nDELETE attribute: status from KangDH');

            // Delete a relationship from document
            await documents.updateOne(
                { _id: docResult.insertedIds[0] },
                { $pull: { relationships: { source: 'Software Architecture', target: 'SOLID' } } }
            );
            console.log('DELETE relationship: Architecture -> SOLID');

            // Delete a document
            const deleteResult = await documents.deleteOne({ _id: docResult.insertedIds[1] });
            console.log(`DELETE document: ${deleteResult.deletedCount} removed`);

            // Delete a user
            const userDelete = await users.deleteOne({ username: 'guingguing' });
            console.log(`DELETE user: ${userDelete.deletedCount} removed`);

            // Verify final state
            const finalDocs = await documents.find({}).toArray();
            const finalUsers = await users.find({}).toArray();
            console.log(`\nFinal state: ${finalUsers.length} users, ${finalDocs.length} documents`);

            console.log('\nAll CRUD operations completed successfully!');

        } catch (error) {
            console.error('Error:', error.message);
        } finally {
            await client.close();
            console.log('\nConnection closed.');
        }
    }

    main();
