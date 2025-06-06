import { getPosts, getCount } from './../state/posts.selector';
import { Post } from './../../models/posts.model';
import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import { autoLogout } from '../../auth/state/auth.actions';
import { deletePost, loadPosts } from '../state/posts.actions';

@Component({
  selector: 'app-posts-list',
  templateUrl: './posts-list.component.html',
  styleUrls: ['./posts-list.component.css'],
})
export class PostsListComponent implements OnInit {
  posts: Observable<Post[]>;
  count: Observable<number>;
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.posts = this.store.select(getPosts);
    this.count = this.store.select(getCount);
    this.store.dispatch(loadPosts());
  }

  onDeletePost(id: string) {
    if (confirm('Are you sure you want to delete')) {
      this.store.dispatch(deletePost({ id }));
    }
  }
  onLogout(event: Event) {
      event.preventDefault();
      this.store.dispatch(autoLogout());
    }
}
