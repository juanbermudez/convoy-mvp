import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
  migrations: [
    // We don't need any migrations for version 1, 
    // but this is where future migrations would go
    // {
    //   toVersion: 2,
    //   steps: [
    //     // Example future migrations
    //   ]
    // }
  ],
});
