import { useState } from "react"
import { Upload, X, Star, MoveUp, MoveDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function MultipleImageUpload({ 
  images, 
  onChange, 
  minImages = 3, 
  maxImages = 5 
}) {
  const [previews, setPreviews] = useState(images || [])

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || [])
    const currentCount = previews.length
    const availableSlots = maxImages - currentCount

    if (files.length > availableSlots) {
      alert(`You can only upload ${availableSlots} more image(s). Maximum ${maxImages} images allowed.`)
      return
    }

    // Validate file size and type
    const validFiles = []
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum file size is 5MB.`)
        continue
      }
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file.`)
        continue
      }
      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    // Create previews
    const newPreviews = []
    let loadedCount = 0

    validFiles.forEach((file, index) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push({
          id: `temp-${Date.now()}-${index}`,
          file: file,
          url: reader.result,
          isPrimary: currentCount === 0 && index === 0,
          order: currentCount + index
        })
        
        loadedCount++
        if (loadedCount === validFiles.length) {
          const updatedPreviews = [...previews, ...newPreviews]
          setPreviews(updatedPreviews)
          onChange(updatedPreviews)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemove = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index)
    // Reorder after removal
    const reordered = newPreviews.map((preview, i) => ({
      ...preview,
      order: i,
      isPrimary: i === 0 ? true : preview.isPrimary && i === 0
    }))
    setPreviews(reordered)
    onChange(reordered)
  }

  const handleSetPrimary = (index) => {
    const newPreviews = previews.map((preview, i) => ({
      ...preview,
      isPrimary: i === index
    }))
    setPreviews(newPreviews)
    onChange(newPreviews)
  }

  const handleMoveUp = (index) => {
    if (index === 0) return
    const newPreviews = [...previews]
    ;[newPreviews[index - 1], newPreviews[index]] = [newPreviews[index], newPreviews[index - 1]]
    const reordered = newPreviews.map((preview, i) => ({
      ...preview,
      order: i
    }))
    setPreviews(reordered)
    onChange(reordered)
  }

  const handleMoveDown = (index) => {
    if (index === previews.length - 1) return
    const newPreviews = [...previews]
    ;[newPreviews[index], newPreviews[index + 1]] = [newPreviews[index + 1], newPreviews[index]]
    const reordered = newPreviews.map((preview, i) => ({
      ...preview,
      order: i
    }))
    setPreviews(reordered)
    onChange(reordered)
  }

  const canAddMore = previews.length < maxImages
  const needsMore = previews.length < minImages

  return (
    <div className="space-y-4">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {previews.length} / {maxImages} images uploaded
          {needsMore && (
            <span className="text-destructive ml-2">
              (Minimum {minImages} required)
            </span>
          )}
        </div>
        {previews.length >= minImages && previews.length <= maxImages && (
          <Badge variant="success" className="bg-green-500">
            ✓ Valid
          </Badge>
        )}
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {previews.map((preview, index) => (
          <div 
            key={preview.id || index} 
            className="relative group aspect-square border-2 rounded-lg overflow-hidden"
            style={{ borderColor: preview.isPrimary ? '#22c55e' : '#e5e7eb' }}
          >
            <img
              src={preview.url}
              alt={`Product ${index + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Primary Badge */}
            {preview.isPrimary && (
              <Badge className="absolute top-2 left-2 bg-green-500">
                <Star className="h-3 w-3 mr-1" />
                Primary
              </Badge>
            )}

            {/* Order Badge */}
            <Badge variant="secondary" className="absolute top-2 right-2">
              {index + 1}
            </Badge>

            {/* Hover Controls */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {!preview.isPrimary && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => handleSetPrimary(index)}
                  title="Set as primary"
                >
                  <Star className="h-4 w-4" />
                </Button>
              )}
              {index > 0 && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => handleMoveUp(index)}
                  title="Move up"
                >
                  <MoveUp className="h-4 w-4" />
                </Button>
              )}
              {index < previews.length - 1 && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => handleMoveDown(index)}
                  title="Move down"
                >
                  <MoveDown className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => handleRemove(index)}
                title="Remove"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {/* Upload Button */}
        {canAddMore && (
          <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">
              Add Image
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              ({maxImages - previews.length} remaining)
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Help Text */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Upload {minImages}-{maxImages} product images (Max 5MB each)</p>
        <p>• First image will be the primary image shown in listings</p>
        <p>• Click star icon to set any image as primary</p>
        <p>• Use arrow buttons to reorder images</p>
        <p>• Hover over images to see controls</p>
      </div>
    </div>
  )
}
