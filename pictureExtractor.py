from docx import Document
import os

def extract_images_from_docx(docx_file_path, output_folder):
    doc = Document(docx_file_path)
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    image_positions = []
    count = 0

    for i, paragraph in enumerate(doc.paragraphs):
        run_index = 0  # Initialize run index
        for run in paragraph.runs:
            inline_shapes = run._element.xpath('.//w:drawing')
            for inline_shape in inline_shapes:
                blip = inline_shape.xpath('.//a:blip')[0]
                image_part = doc.part.related_parts[blip.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')]
                image_bytes = image_part.blob
                image_file_extension = image_part.content_type.split('/')[-1]

                count += 1
                image_filename = f"image_{count}.{image_file_extension}"
                image_path = os.path.join(output_folder, image_filename)
                with open(image_path, "wb") as f:
                    f.write(image_bytes)

                # Save image position with manual run index tracking
                image_positions.append({
                    "filename": image_filename,
                    "paragraph_index": i,
                    "run_index": run_index
                })

                print(f"Image {count} saved to: {image_path}")
            run_index += 1  # Increment run index for each run

    return image_positions, output_folder
