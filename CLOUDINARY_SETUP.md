# Cloudinary Setup Guide

## Environment Variables

Make sure you have these environment variables in your `.env` file:

```
VITE_CLOUD_NAME=your_cloud_name
VITE_API_KEY=your_api_key
VITE_API_SECRET=your_api_secret
```

## Upload Preset Setup

### Option 1: Use Default Preset (Recommended for testing)

The current implementation uses `ml_default` which is a default preset that should work out of the box.

### Option 2: Create Custom Upload Preset

1. Go to your Cloudinary Dashboard
2. Navigate to **Settings** > **Upload**
3. Scroll down to **Upload presets**
4. Click **Add upload preset**
5. Set the following:
   - **Preset name**: `waflow_receipts` (or any name you prefer)
   - **Signing Mode**: `Unsigned`
   - **Folder**: `waflow/receipts` (optional, for organization)
6. Click **Save**

If you create a custom preset, update the `upload_preset` in `src/lib/cloudinary.ts`:

```typescript
formData.append("upload_preset", "waflow_receipts"); // Your custom preset name
```

## How It Works

### File Selection

- When a user selects a receipt file, it's stored locally but not uploaded immediately
- The UI shows "File selected: filename.pdf" to confirm selection

### Upload Process

- Files are uploaded to Cloudinary only when the "Create Application" button is clicked
- All receipts are uploaded in parallel during form submission
- If any upload fails, the application is still created but without that receipt
- Users get feedback about upload success/failure

### Security

- Uses unsigned uploads (no server-side signature required)
- Files are uploaded directly from the browser to Cloudinary
- No sensitive credentials are exposed in the frontend

## Troubleshooting

### "Upload preset not found" Error

**Solution 1: Create an Upload Preset**

1. Go to your Cloudinary Dashboard
2. Navigate to **Settings** > **Upload**
3. Scroll down to **Upload presets**
4. Click **Add upload preset**
5. Set:
   - **Preset name**: `waflow_receipts`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `waflow/receipts` (optional)
6. Click **Save**
7. Update `src/lib/cloudinary.ts`:
   ```typescript
   formData.append("upload_preset", "waflow_receipts");
   ```

**Solution 2: Use No Upload Preset (Alternative)**
If you want to try without an upload preset, modify `src/lib/cloudinary.ts`:

```typescript
// Remove this line:
// formData.append("upload_preset", "ml_default");

// Add these lines instead:
formData.append("api_key", import.meta.env.VITE_API_KEY);
```

### "process is not defined" Error

- This was fixed by removing the Cloudinary SDK import
- The current implementation uses direct fetch calls which work in browsers

### File Upload Fails

1. **Check Environment Variables**:

   - Ensure all variables start with `VITE_`
   - Restart your development server after adding variables
   - Check for typos in variable names

2. **Verify Cloudinary Account**:

   - Make sure your Cloudinary account is active
   - Check that you're using the correct cloud name
   - Verify your API key is correct

3. **Check Upload Preset**:

   - Ensure the upload preset exists in your dashboard
   - Make sure it's set to "Unsigned" mode
   - Check that it allows the file types you're uploading

4. **Test with Debug Component**:
   - Use the `CloudinaryTest` component to test uploads
   - Check browser console for detailed error messages
   - Verify environment variables are loaded correctly

### Common Issues and Solutions

**Issue**: "Invalid API key"

- **Solution**: Check your API key in the Cloudinary dashboard and ensure it matches your `.env` file

**Issue**: "Cloud name not found"

- **Solution**: Verify your cloud name in the Cloudinary dashboard URL (e.g., `https://cloudinary.com/console`)

**Issue**: "Upload preset not found"

- **Solution**: Create an upload preset as described above, or use the alternative approach without upload preset

**Issue**: "CORS error"

- **Solution**: Cloudinary handles CORS automatically. If you see CORS errors, check your browser's network tab for the actual error

## Testing Your Setup

1. **Use the Test Component**:

   ```typescript
   import { CloudinaryTest } from "@/components/CloudinaryTest";

   // Add this to any page to test uploads
   <CloudinaryTest />;
   ```

2. **Check Browser Console**:

   - Open browser developer tools
   - Look for console logs from the upload function
   - Check the Network tab for failed requests

3. **Verify Environment Variables**:
   - The test component will show if your environment variables are loaded
   - Make sure they're not showing as "Not set"

## File Types Supported

- PDF files (.pdf)
- Images (.jpg, .jpeg, .png)

## Usage

1. Select a receipt file in the payment entry
2. Fill out the rest of the application form
3. Click "Create Application"
4. Files will be uploaded automatically during submission
5. Check the application details page to view uploaded receipts
