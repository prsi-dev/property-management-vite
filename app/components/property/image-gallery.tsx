type ImageGalleryProps = {
  images: string[];
  alt: string;
};

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-lg">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${alt} - Image ${index + 1}`}
            className="h-64 w-full rounded-lg object-cover"
          />
        ))}
      </div>
    </div>
  );
}
