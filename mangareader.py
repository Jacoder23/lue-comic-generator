import sys
from tkinter import Tk, messagebox
from mangarender import extract_render
import templates

if __name__ == '__main__':
    if len(sys.argv) <= 1:
        Tk().withdraw()
        messagebox.showinfo('HTML MangaReader - simply the fastest comic book reader',
                            'Start reading your favorite comics by doing one of the following:\n'
                            '- Drag an image folder or file onto the MangaReader icon, or\n'
                            '- Drag a ZIP or CBZ archive onto the MangaReader icon')
        exit(0)
    path = '.' if len(sys.argv) <= 1 else sys.argv[1]
    extract_render(path, templates.DOC_TEMPLATE, templates.IMG_TEMPLATE, templates.BOOT_TEMPLATE, templates.DEFAULT_IMAGETYPES)