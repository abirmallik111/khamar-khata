import { db } from '../src/db';
import { goats, goatImages } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function migrateImages() {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  console.log('🚀 Checking images in goats table...');
  const allGoats = await db.select().from(goats);
  let goatCount = 0;

  for (const goat of allGoats) {
    if (goat.imageUrl && goat.imageUrl.includes('supabase.co')) {
      try {
        const url = goat.imageUrl;
        const filename = path.basename(new URL(url).pathname);
        const localPath = path.join(uploadDir, filename);

        console.log(`⬇️ Downloading goat image: ${goat.nameOrTag} (${filename})...`);
        const res = await fetch(url);
        if (!res.ok) {
          console.error(`❌ Failed to download ${url}: ${res.statusText}`);
          continue;
        }

        const arrayBuffer = await res.arrayBuffer();
        fs.writeFileSync(localPath, Buffer.from(arrayBuffer));

        const newUrl = `/uploads/${filename}`;
        await db.update(goats)
          .set({ imageUrl: newUrl })
          .where(eq(goats.id, goat.id));

        console.log(`✅ Updated goat ${goat.nameOrTag} to local path: ${newUrl}`);
        goatCount++;
      } catch (err) {
        console.error(`❌ Error migrating goat image for ${goat.nameOrTag}:`, err);
      }
    }
  }

  console.log(`\n🚀 Checking gallery images in goat_images table...`);
  const allGallery = await db.select().from(goatImages);
  let galleryCount = 0;

  for (const gi of allGallery) {
    if (gi.imageUrl && gi.imageUrl.includes('supabase.co')) {
      try {
        const url = gi.imageUrl;
        const filename = path.basename(new URL(url).pathname);
        const localPath = path.join(uploadDir, filename);

        console.log(`⬇️ Downloading gallery image: ${gi.id} (${filename})...`);
        const res = await fetch(url);
        if (!res.ok) {
          console.error(`❌ Failed to download ${url}: ${res.statusText}`);
          continue;
        }

        const arrayBuffer = await res.arrayBuffer();
        fs.writeFileSync(localPath, Buffer.from(arrayBuffer));

        const newUrl = `/uploads/${filename}`;
        await db.update(goatImages)
          .set({ imageUrl: newUrl })
          .where(eq(goatImages.id, gi.id));

        console.log(`✅ Updated gallery ${gi.id} to local path: ${newUrl}`);
        galleryCount++;
      } catch (err) {
        console.error(`❌ Error migrating gallery image ${gi.id}:`, err);
      }
    }
  }

  console.log(`\n🎉 Image migration complete!`);
  console.log(`Migrated ${goatCount} goat profile images.`);
  console.log(`Migrated ${galleryCount} goat gallery images.`);
  process.exit(0);
}

migrateImages().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
