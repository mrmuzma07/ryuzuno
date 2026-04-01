
-- Create storage bucket for course thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true);

-- Allow authenticated users to upload to course-thumbnails
CREATE POLICY "Authenticated users can upload course thumbnails"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'course-thumbnails');

-- Allow public read access
CREATE POLICY "Public can view course thumbnails"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'course-thumbnails');

-- Allow users to update their own uploads
CREATE POLICY "Users can update own course thumbnails"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'course-thumbnails');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own course thumbnails"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'course-thumbnails');
